# agents/savings_agent.py
import datetime
class SavingsAgent:
    """
    Agent 3: Auto-Save Guardian
    Autonomously manages savings and protects bills
    """
    
    def __init__(self, user_id, db, income_agent, crisis_agent):
        self.user_id = user_id
        self.db = db
        self.income_agent = income_agent
        self.crisis_agent = crisis_agent
        
        self.state = {
            'mode': 'normal',  # 'normal', 'crisis', 'paused'
            'fund_balance': 0,
            'reserved_for_bills': 0,
            'auto_save_enabled': False
        }
        
        self.goal = 10000  # ₹10K emergency fund
    
    def activate_crisis_mode(self, crisis_info):
        """
        REACTIVE: Respond to crisis from Agent 2
        """
        print(f"🛡️ Savings Agent: CRISIS MODE ACTIVATED")
        
        self.state['mode'] = 'crisis'
        
        # AUTONOMOUS DECISION: Pause auto-saves
        if self.state['auto_save_enabled']:
            self.pause_auto_save(reason="Crisis detected by Agent 2")
        
        # PROACTIVE: Lock emergency fund
        self.db.update_user_state(self.user_id, {
            'emergency_fund_locked': True,
            'crisis_mode_since': datetime.now()
        })
        
        print(f"💰 Emergency fund (₹{self.state['fund_balance']:.0f}) is now protected")
    
    def suggest_daily_save(self):
        """
        INTELLIGENT: Calculate optimal save amount
        """
        # CONTEXT AWARE: Check with other agents first
        income_forecast = self.income_agent.predict_scenarios(7)
        crisis_status = self.crisis_agent.state.get('active_crisis')
        
        if crisis_status:
            print("⏸️ Savings Agent: Skipping save (crisis mode)")
            return None
        
        # Get financial state
        balance = self.db.get_balance(self.user_id)
        reserved = self._calculate_bill_reserves()
        available = balance - reserved
        
        if available < 500:
            print("⏸️ Savings Agent: Balance too low to save safely")
            return None
        
        # INTELLIGENT CALCULATION
        save_amount = min(
            available * 0.10,  # 10% of available
            100,  # Max ₹100
            self.goal - self.state['fund_balance']  # Don't over-save
        )
        
        # GOAL-ORIENTED: Track progress
        progress = (self.state['fund_balance'] / self.goal) * 100
        
        return {
            'amount': save_amount,
            'available_after': available - save_amount,
            'fund_progress': progress,
            'message': f"💡 Save ₹{save_amount:.0f} today? Fund: {progress:.1f}% complete"
        }
    
    def auto_reserve_bills(self):
        """
        PROACTIVE: Automatically protect bill money
        """
        print("🛡️ Savings Agent: Checking upcoming bills...")
        
        # Get bills due in next 14 days
        upcoming_bills = self.db.get_upcoming_bills(self.user_id, days=14)
        
        if not upcoming_bills:
            return None
        
        total_to_reserve = sum(bill['amount'] for bill in upcoming_bills)
        
        # AUTONOMOUS DECISION: Reserve the money
        self.state['reserved_for_bills'] = total_to_reserve
        self.db.update_user_state(self.user_id, {
            'reserved_amount': total_to_reserve,
            'reserved_for': [b['name'] for b in upcoming_bills]
        })
        
        balance = self.db.get_balance(self.user_id)
        available = balance - total_to_reserve
        
        print(f"✅ Reserved ₹{total_to_reserve:.0f} for bills. Available: ₹{available:.0f}")
        
        # PROACTIVE: Warn if low available balance
        if available < 2000:
            self._broadcast_warning({
                'type': 'low_available_balance',
                'available': available,
                'reserved': total_to_reserve,
                'message': f"Only ₹{available:.0f} available after bill reserves"
            })
        
        return {
            'reserved': total_to_reserve,
            'available': available,
            'bills': upcoming_bills
        }
    
    def alert_risky_spending(self, purchase_amount):
        """
        REACTIVE: Warn user before risky purchase
        """
        # COMMUNICATION: Check crisis probability
        crisis_status = self.crisis_agent.run_scenario_analysis()
        
        if not crisis_status or crisis_status['probability'] < 0.6:
            return None  # No warning needed
        
        # INTELLIGENT: Calculate impact
        balance = self.db.get_balance(self.user_id)
        available = balance - self.state['reserved_for_bills']
        
        impact = self.crisis_agent.simulate_decision('reduce_expense', {
            'amount': purchase_amount
        })
        
        return {
            'warning': True,
            'crisis_probability': crisis_status['probability'],
            'purchase_amount': purchase_amount,
            'impact': impact,
            'message': f"⚠️ Crisis risk: {crisis_status['probability']*100:.0f}%. "
                      f"This ₹{purchase_amount} purchase increases risk to "
                      f"{impact['after']['probability']*100:.0f}%",
            'alternatives': [
                f"Skip purchase: Risk stays {crisis_status['probability']*100:.0f}%",
                f"Buy cheaper option: Reduced impact",
                f"Wait until {crisis_status['days_to_crisis']} days pass"
            ]
        }
    
    def get_fund_balance(self):
        """
        Simple getter for other agents
        """
        return self.state['fund_balance']
    
    def _broadcast_warning(self, warning):
        print(f"⚠️ Savings Agent Warning: {warning['type']}")