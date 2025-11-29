from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
from typing import Optional, Dict, Any
import asyncio
from hybrid_chat import initialize_agent_system, chat as hybrid_chat, agent_systems

# New imports: use your new modules
from .models.forecast import generate_three_scenarios
from .models.agent_system import AgentSystem


app = FastAPI(
    title="FinMate AI API",
    description="Financial crisis prevention for gig workers with autonomous agents",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with Firebase / real DB later)
user_data_store: Dict[str, Dict[str, Any]] = {}


# -------------------------------------------------------------------
# Simple in-memory "DB" wrapper that matches what agents expect
# -------------------------------------------------------------------
class InMemoryDB:
    def __init__(self, store: Dict[str, Dict[str, Any]]):
        self.store = store

    def _ensure_user(self, user_id: str) -> Dict[str, Any]:
        return self.store.setdefault(user_id, {})

    def get_transactions(self, user_id: str, days: int = 60):
        user = self._ensure_user(user_id)
        # stored as list of {date, amount, type}
        return user.get("transactions", [])

    def get_balance(self, user_id: str) -> float:
        user = self._ensure_user(user_id)
        return float(user.get("balance", 0.0))

    def get_upcoming_bills(self, user_id: str, days: int = 14):
        user = self._ensure_user(user_id)
        # list of {name, amount, due_date}
        return user.get("bills", [])

    def get_avg_daily_expenses(self, user_id: str) -> float:
        user = self._ensure_user(user_id)
        return float(user.get("avg_expenses", 0.0))

    def update_user_state(self, user_id: str, updates: dict):
        user = self._ensure_user(user_id)
        state = user.setdefault("state", {})
        state.update(updates)

    def save_crisis_alert(self, user_id: str, crisis_info: dict):
        user = self._ensure_user(user_id)
        alerts = user.setdefault("crisis_alerts", [])
        alerts.append(crisis_info)


# Global DB instance shared by agent systems
db = InMemoryDB(user_data_store)


def get_agent_system(user_id: str) -> AgentSystem:
    """
    Helper to construct an AgentSystem for a given user.
    """
    return AgentSystem(user_id=user_id, db=db)


# -------------------------------------------------------------------
# Request models
# -------------------------------------------------------------------
class ForecastRequest(BaseModel):
    user_id: str = "demo_user"
    periods: Optional[int] = 90


class ChatRequest(BaseModel):
    user_id: str = "demo_user"
    message: str
    history: Optional[list] = None


# (optional) you can re-add a simulate request later if needed
# class SimulateRequest(BaseModel):
#     user_id: str = "demo_user"
#     action: dict


# -------------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "message": "FinMate AI API is running",
        "version": "2.0.0",
        "endpoints": [
            "/api/income/upload",
            "/api/forecast/generate",
            "/api/agents/daily-check",
            "/api/health",
        ],
    }


@app.post("/api/income/upload")
async def upload_income(file: UploadFile = File(...)):
    """
    Upload CSV with income data
    Expected format: date,income
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Validate columns
        if "date" not in df.columns or "income" not in df.columns:
            raise HTTPException(
                status_code=400,
                detail="CSV must have 'date' and 'income' columns",
            )

        # Clean data
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")

        # Convert to list of dicts
        income_data = df[["date", "income"]].to_dict("records")
        income_data = [
            {"date": str(row["date"].date()), "income": float(row["income"])}
            for row in income_data
        ]

        # Store in memory (later: real DB)
        user_id = "demo_user"  # you can pass this from frontend later
        user = user_data_store.setdefault(user_id, {})
        user["income_data"] = income_data
        user["uploaded_at"] = pd.Timestamp.now().isoformat()

        # Also save basic "transactions" so IncomeAgent can work
        user["transactions"] = [
            {
                "date": rec["date"],
                "amount": rec["income"],
                "type": "income",
            }
            for rec in income_data
        ]

        # default dummy values for other DB fields used by agents
        user.setdefault("balance", df["income"].mean() * 5)  # some starting buffer
        user.setdefault("bills", [])         # you can fill this from UI later
        user.setdefault("avg_expenses", 500) # tweak later

        return {
            "message": "Income data uploaded successfully",
            "rows": len(income_data),
            "date_range": f"{income_data[0]['date']} to {income_data[-1]['date']}",
            "avg_income": f"₹{df['income'].mean():.0f}/day",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/forecast/generate")
async def generate_forecast(request: ForecastRequest):
    """
    Generate 3 financial futures using Prophet + basic agent insights.
    """
    try:
        user_id = request.user_id
        periods = request.periods or 90

        # Get user's income data OR load demo data
        if user_id not in user_data_store or "income_data" not in user_data_store[user_id]:
            # Load demo data for testing
            print(f"⚠️  No data for {user_id}, loading demo data.")
            demo_data = pd.read_csv("data/sample_income.csv")
            demo_data["date"] = pd.to_datetime(demo_data["date"])
            income_data = [
                {"date": str(row["date"].date()), "income": float(row["income"])}
                for _, row in demo_data.iterrows()
            ]
            user_data_store[user_id] = {
                "income_data": income_data,
                "transactions": [
                    {"date": rec["date"], "amount": rec["income"], "type": "income"}
                    for rec in income_data
                ],
                "balance": demo_data["income"].mean() * 5,
                "bills": [],
                "avg_expenses": 500,
            }
        else:
            income_data = user_data_store[user_id]["income_data"]

        print(f"\n🚀 Generating forecast for {user_id}.")

        # 1) Use Prophet-based forecasting
        scenarios = generate_three_scenarios(income_data, periods=periods)

        # 2) Let IncomeAgent analyze income pattern (uses our in-memory DB)
        agent_system = get_agent_system(user_id)
        income_pattern = agent_system.income_agent.analyze_income_pattern()

        # 3) Run crisis analysis to get interventions/suggestions
        crisis_info = agent_system.crisis_agent.run_scenario_analysis()
        interventions = []
        if crisis_info and crisis_info.get('interventions'):
            interventions = crisis_info['interventions']

        # Build suggestions list for frontend (actions tab)
        suggestions = []
        for idx, intv in enumerate(interventions[:5], start=1):
            suggestions.append({
                "id": idx,
                "action": intv.get('action', 'Take action'),
                "impact": f"+₹{intv.get('impact', 0):,.0f}",
                "type": intv.get('type', 'general'),
            })

        # Fallback default suggestions if none from crisis agent
        if not suggestions:
            suggestions = [
                {"id": 1, "action": "Take 2 extra shifts this week", "impact": "+₹3,200", "type": "income"},
                {"id": 2, "action": "Skip dining out (5 days)", "impact": "+₹1,500", "type": "expense"},
                {"id": 3, "action": "Reduce entertainment budget", "impact": "+₹800", "type": "expense"},
            ]

        # 4) Build activity list from recent income data
        activity = []
        recent_income = income_data[-14:] if len(income_data) >= 14 else income_data
        for rec in recent_income[-7:]:  # last 7 days
            activity.append({
                "date": rec["date"],
                "amount": rec["income"],
                "type": "income",
            })

        # Store minimal stuff for later use
        user_data_store[user_id]["scenarios"] = scenarios
        user_data_store[user_id]["income_pattern"] = income_pattern
        user_data_store[user_id]["suggestions"] = suggestions
        user_data_store[user_id]["activity"] = activity

        print("✅ Forecast generated successfully!\n")

        return {
            "scenarios": scenarios,
            "suggestions": suggestions,
            "activity": activity,
            "crisis": crisis_info,
            "agent_insights": {
                "income_pattern": income_pattern,
                "income_agent_state": agent_system.income_agent.state,
            },
            "metadata": {
                "forecast_days": len(scenarios.get("dates", [])),
                "generated_at": pd.Timestamp.now().isoformat(),
            },
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/agents/daily-check")
async def agents_daily_check(user_id: str = "demo_user"):
    """
    Run the full AgentSystem: income forecast + crisis check + savings suggestion.

    NOTE: This will only work correctly once:
      - IncomeAgent._prophet_forecast
      - IncomeAgent._fallback_simple_prediction
      - CrisisAgent._simulate_scenario
    are implemented in your agent files.
    """
    try:
        agent_system = get_agent_system(user_id)
        result = agent_system.daily_check()
        return result
    except Exception as e:
        # If some internal agent method is still 'pass', you'll see it here.
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "users_in_memory": len(user_data_store),
    }


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Chat with FinMate AI using OpenAI GPT-3.5-turbo.
    The bot has access to user's financial data and provides personalized advice.
    """
    try:
        user_id = request.user_id
        message = request.message
        history = request.history or []

        # Initialize agent system if not already done
        initialize_agent_system(user_id, db)

        # Get response from hybrid chat (uses OpenAI)
        result = hybrid_chat(user_id, message, history)

        if result.get('success'):
            return {
                "response": result['response'],
                "success": True
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Unknown error'))

    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    print("\n🚀 Starting FinMate AI Backend...")
    print("📍 API Docs: http://localhost:8000/docs")
    print("📍 Health:   http://localhost:8000/api/health\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


