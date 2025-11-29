# hybrid_chat.py
"""
Hybrid Chat Agent - Uses Groq (free) with Llama 3.3 70B
Fast, free, and reliable
"""
from groq import Groq
import os
from dotenv import load_dotenv

# Load .env from same folder as this file (robust)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Initialize Groq client (expects GROQ_API_KEY in .env)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Global storage for agent systems
agent_systems = {}


def initialize_agent_system(user_id, db):
    """Initialize the 3-agent system for a user"""
    from app.models.agent_system import AgentSystem
    
    if user_id not in agent_systems:
        print(f"🚀 Initializing agent system for user {user_id}")
        agent_systems[user_id] = AgentSystem(user_id, db)
        # Run daily check to populate agent states
        try:
            agent_systems[user_id].daily_check()
        except Exception as e:
            print(f"⚠️ Daily check failed (OK for demo): {e}")
    
    return agent_systems[user_id]


def get_user_context(user_id):
    """
    Build a system prompt (role + data) that will be sent as the model's
    system message. This prompt gives the bot its role and instructs it
    how to behave using the user's real data.
    """
    # Import user_data_store to access uploaded CSV data
    from app.main import user_data_store
    
    # Get uploaded data directly
    user_store = user_data_store.get(user_id, {})
    income_data = user_store.get('income_data', [])
    transactions = user_store.get('transactions', [])
    current_balance = user_store.get('balance', 0)
    avg_expenses = user_store.get('avg_expenses', 500)
    
    # Get agent data if available
    system = agent_systems.get(user_id)
    forecast = None
    pattern = 'unknown'
    crisis = None
    savings_state = {}
    
    if system:
        forecast = system.income_agent.state.get('last_forecast')
        pattern = system.income_agent.state.get('pattern', 'unknown')
        crisis = system.crisis_agent.state.get('active_crisis')
        savings_state = system.savings_agent.state

    # === SYSTEM ROLE PROMPT (FinMate AI) ===
    role_prompt = """
You are **FinMate AI**, an expert, empathetic financial coach for gig workers in India.

Role & behavior:
- Be warm, supportive and non-judgmental.
- Be practical: offer concise, actionable steps the user can actually do.
- Use Indian Rupees symbol (₹) for all amounts.
- Keep answers short (≤ 100 words) and easy to act on.
- If data is missing, explicitly state which data is missing and ask for it.
- If a financial crisis is detected, acknowledge it calmly and give 2–3 prioritized, concrete interventions.
- If safe, suggest one small immediate action (example: "Do 2 extra shifts", "Pause dining out for 5 days") and one structural action (example: "Start auto-save ₹50/day").
- When possible, show quick estimates (e.g., "This will add ~₹X to your balance by rent day").
- Always base your advice solely on the data provided below; do not hallucinate facts.
"""

    # === BUILD DATA SECTION ===
    data_section = "\n\nUSER FINANCIAL DATA (real):\n"
    
    # Add actual uploaded income data
    if income_data:
        recent_income = income_data[-14:] if len(income_data) > 14 else income_data
        total_income = sum(d['income'] for d in recent_income)
        avg_daily = total_income / len(recent_income) if recent_income else 0
        max_income = max(d['income'] for d in recent_income) if recent_income else 0
        min_income = min(d['income'] for d in recent_income) if recent_income else 0
        
        data_section += f"\n- UPLOADED INCOME DATA ({len(income_data)} days total):\n"
        data_section += f"  • Date range: {income_data[0]['date']} to {income_data[-1]['date']}\n"
        data_section += f"  • Average daily income: ₹{avg_daily:.0f}\n"
        data_section += f"  • Highest day: ₹{max_income:.0f}\n"
        data_section += f"  • Lowest day: ₹{min_income:.0f}\n"
        data_section += f"  • Total (last {len(recent_income)} days): ₹{total_income:.0f}\n"
        
        # Show last 7 days detail
        last_7 = income_data[-7:] if len(income_data) >= 7 else income_data
        data_section += f"  • Last {len(last_7)} days breakdown:\n"
        for d in last_7:
            data_section += f"    - {d['date']}: ₹{d['income']:.0f}\n"
    else:
        data_section += "- No income data uploaded yet.\n"
    
    # Current balance and expenses
    data_section += f"\n- Current estimated balance: ₹{current_balance:.0f}\n"
    data_section += f"- Average daily expenses: ₹{avg_expenses:.0f}\n"

    # Income / forecast from agents
    if forecast:
        opt = sum(forecast.get('optimistic', [])) if forecast.get('optimistic') else 0
        real = sum(forecast.get('base', [])) if forecast.get('base') else 0
        pess = sum(forecast.get('pessimistic', [])) if forecast.get('pessimistic') else 0
        data_section += f"\n- Income pattern detected: {pattern}\n"
        data_section += "- Next 14 days income forecast (totals):\n"
        data_section += f"  • Optimistic: ₹{opt:.0f}\n"
        data_section += f"  • Realistic:  ₹{real:.0f}\n"
        data_section += f"  • Pessimistic: ₹{pess:.0f}\n"

    # Crisis
    data_section += "\n- Crisis status:\n"
    if crisis and crisis.get('detected'):
        data_section += f"  • CRISIS DETECTED: Yes\n"
        data_section += f"  • Days to crisis: {crisis.get('days_to_crisis')} days\n"
        data_section += f"  • Projected deficit: ₹{crisis.get('deficit_amount', 0):.0f}\n"
        data_section += f"  • Probability: {crisis.get('probability', 0)*100:.0f}%\n"
        data_section += f"  • Severity: {crisis.get('severity', 'MEDIUM')}\n"
        if crisis.get('interventions'):
            data_section += "  • Top suggested interventions:\n"
            for i, it in enumerate(crisis.get('interventions', [])[:3], 1):
                action = it.get('action', '—')
                impact = it.get('impact', 0)
                data_section += f"    {i}. {action} (saves ₹{impact:.0f})\n"
    else:
        data_section += "  • No active crisis detected.\n"

    # Savings
    fund_balance = savings_state.get('fund_balance', 0)
    reserved = savings_state.get('reserved_for_bills', 0)
    mode = savings_state.get('mode', 'normal')
    progress_pct = (fund_balance / 10000) * 100 if fund_balance else 0.0

    data_section += f"\n- Savings:\n"
    data_section += f"  • Emergency fund balance: ₹{fund_balance:.0f} / ₹10,000 ({progress_pct:.1f}%)\n"
    data_section += f"  • Reserved for bills: ₹{reserved:.0f}\n"
    data_section += f"  • Mode: {mode}\n"

    # === INSTRUCTIONS (how the assistant should answer) ===
    instructions = """
    
INSTRUCTIONS TO THE ASSISTANT:
- Answer in plain English; be empathetic and practical.
- Provide 1 immediate action and up to 2 prioritized next steps.
- Use approximate numbers when useful (prefix with "~" if estimated).
- If you cannot compute due to missing data, ask for the specific data needed (e.g., "How many days of income history do you have?").
- Keep the tone hopeful and focused on what the user can do right now.
- Reference the actual income data shown above when giving advice.
"""

    # Combine everything
    context = role_prompt + data_section + instructions
    return context


def chat(user_id, message, history=None):
    """
    Chat with user using Groq (Llama 3.3 70B) - FREE and fast!
    """
    try:
        # Build system + user messages
        context = get_user_context(user_id)
        messages = [{"role": "system", "content": context}]

        # Append limited history
        if history:
            for msg in history[-6:]:
                role = msg.get('role', 'user')  # expecting 'user' or 'assistant'
                content = msg.get('content', '')
                if role and content:
                    messages.append({"role": role, "content": content})

        # Current user input
        messages.append({"role": "user", "content": message})

        # Call Groq with Llama 3.3 70B
        print(f"\n🤖 Processing user message: {message}")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=250,
            temperature=0.7
        )

        assistant_message = response.choices[0].message.content
        print(f"✅ Generated response (preview): {assistant_message[:120]}")

        return {'response': assistant_message, 'success': True}

    except Exception as e:
        print(f"❌ Error in hybrid_chat.chat: {e}")
        return {'response': f"Error: {str(e)}", 'success': False, 'error': str(e)}
