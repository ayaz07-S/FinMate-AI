# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys

# ensure current file's folder is on path so imports like "app.models..." work
BASE_DIR = os.path.dirname(__file__)
sys.path.append(BASE_DIR)

# load .env from backend folder
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# Import hybrid agent functions AFTER loading .env
from hybrid_chat import initialize_agent_system, chat as hybrid_chat, agent_systems

# If you have a DB wrapper, import it. If not, pass None to initialize_agent_system
try:
    from app.services.firebase import DB
    db = DB()
except Exception:
    db = None

app = Flask(__name__)
CORS(app)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "FinMate Hybrid Chat",
        "model": "gpt-3.5-turbo (direct)"
    })


@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    """
    Body:
    {
      "user_id": "rahul",
      "message": "Am I in danger?",
      "chat_history": [{"role":"user","content":"..."}]   # optional
    }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    user_id = data.get("user_id")
    message = data.get("message")
    history = data.get("chat_history", [])

    if not user_id or not message:
        return jsonify({"error": "user_id and message are required"}), 400

    # Ensure agent system exists
    initialize_agent_system(user_id, db)

    # Chat (returns dict with 'response' and 'success')
    result = hybrid_chat(user_id, message, history)
    return jsonify(result)


@app.route("/api/agent-status/<user_id>", methods=["GET"])
def agent_status(user_id):
    if user_id not in agent_systems:
        initialize_agent_system(user_id, db)

    system = agent_systems[user_id]

    return jsonify({
        "user_id": user_id,
        "income_pattern": system.income_agent.state.get("pattern"),
        "last_forecast_exists": system.income_agent.state.get("last_forecast") is not None,
        "crisis_active": system.crisis_agent.state.get("active_crisis") is not None,
        "savings_balance": system.savings_agent.state.get("fund_balance", 0),
        "success": True
    })


@app.route("/api/run-agents/<user_id>", methods=["POST"])
def run_agents(user_id):
    # manually trigger daily_run and return a short summary
    if user_id not in agent_systems:
        initialize_agent_system(user_id, db)

    system = agent_systems[user_id]
    try:
        results = system.daily_run()
        return jsonify({
            "message": "Agents executed",
            "results": results,
            "success": True
        })
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500


if __name__ == "__main__":
    # check API key presence
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in environment. Set it in .env or export it.")
        exit(1)

    port = int(os.getenv("FLASK_PORT", 5000))
    print(f"Starting API on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
