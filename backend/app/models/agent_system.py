from .income_agent import IncomeAgent
from .save_agent import SavingsAgent        
from .crisis import CrisisAgent
class AgentSystem:
    """
    Coordinates all 3 agents
    """
    
    def __init__(self, user_id, db):
        # Initialize agents
        self.income_agent = IncomeAgent(user_id, db)
        self.savings_agent = SavingsAgent(user_id, db, None, None)
        self.crisis_agent = CrisisAgent(user_id, db, self.income_agent, self.savings_agent)
        
        # Give agents references to each other
        self.savings_agent.income_agent = self.income_agent
        self.savings_agent.crisis_agent = self.crisis_agent
    
    def daily_check(self):
        """
        Agents work together autonomously
        """
        print("🚀 Agent System: Running daily check...")
        
        # Agent 1: Predict income
        income_forecast = self.income_agent.predict_scenarios(14)
        
        # Agent 2: Check for crises
        crisis_info = self.crisis_agent.run_scenario_analysis()
        
        # Agent 3: Manage savings
        if not crisis_info:
            # Normal mode: suggest savings
            save_suggestion = self.savings_agent.suggest_daily_save()
            bill_reserves = self.savings_agent.auto_reserve_bills()
        else:
            # Crisis mode: Agent 3 automatically goes defensive
            pass
        
        return {
            'income_forecast': income_forecast,
            'crisis_status': crisis_info,
            'savings_action': save_suggestion if not crisis_info else 'PAUSED'
        }