"""
Crisis detection and alert logic
"""
import numpy as np


# agents/crisis_agent.py
class CrisisAgent:
    """
    Agent 2: Crisis Detector
    Autonomously monitors for crises and suggests interventions
    """
    
    def __init__(self, user_id, db, income_agent, savings_agent):
        self.user_id = user_id
        self.db = db
        self.income_agent = income_agent  # Can talk to other agents
        self.savings_agent = savings_agent
        
        self.state = {
            'active_crisis': None,
            'crisis_history': [],
            'monitoring': True
        }
        
        self.thresholds = {
            'critical': 0.70,  # 70%+ crisis probability
            'high': 0.50,
            'medium': 0.30
        }
    
    def monitor_continuously(self):
        """
        PROACTIVE: Doesn't wait to be called, actively checks
        """
        print(f"👁️ Crisis Agent: Monitoring user {self.user_id}")
        
        # AUTONOMOUS: Decide when to run analysis
        if self._should_run_analysis():
            crisis_info = self.run_scenario_analysis()
            
            if crisis_info and crisis_info['probability'] > self.thresholds['medium']:
                self._handle_crisis_detected(crisis_info)
    
    def run_scenario_analysis(self):
        """
        INTELLIGENT: Multi-step analysis with decision-making
        """
        print("🔍 Crisis Agent: Running scenario analysis...")
        
        # COMMUNICATION: Get data from Income Agent
        scenarios = self.income_agent.predict_scenarios(14)
        
        # Get current financial state
        balance = self.db.get_balance(self.user_id)
        bills = self.db.get_upcoming_bills(self.user_id, days=14)
        avg_expenses = self.db.get_avg_daily_expenses(self.user_id)
        
        # INTELLIGENT ANALYSIS: Run multiple scenarios
        crisis_scenarios = []
        
        for scenario_name in ['pessimistic', 'base', 'optimistic']:
            income_stream = scenarios[scenario_name]
            result = self._simulate_scenario(
                income_stream, 
                balance, 
                bills, 
                avg_expenses
            )
            crisis_scenarios.append(result)
        
        # DECISION: Calculate probability
        crises_detected = sum(1 for s in crisis_scenarios if s['crisis'])
        probability = crises_detected / len(crisis_scenarios)
        
        if probability > 0:
            # Find the earliest crisis
            crisis_days = [s['days_to_crisis'] for s in crisis_scenarios if s['crisis']]
            earliest = min(crisis_days)
            deficit = next(s['deficit'] for s in crisis_scenarios if s['days_to_crisis'] == earliest)
            
            crisis_info = {
                'detected': True,
                'probability': probability,
                'days_to_crisis': earliest,
                'deficit': deficit,
                'severity': self._classify_severity(probability, earliest)
            }
            
            # GOAL-ORIENTED: Generate solutions
            crisis_info['interventions'] = self._generate_interventions(crisis_info)
            
            return crisis_info
        
        return None
    
    def _generate_interventions(self, crisis_info):
        """
        INTELLIGENT: Create personalized action plans
        """
        interventions = []
        deficit = crisis_info['deficit']
        
        # CONTEXT AWARE: Check income pattern from Income Agent
        income_pattern = self.income_agent.state.get('income_pattern')
        
        # Generate income-based interventions
        if income_pattern == 'variable':
            # Gig worker - suggest extra shifts
            shifts_needed = int(deficit / 1500) + 1
            interventions.append({
                'type': 'income_boost',
                'action': f'Take {shifts_needed} extra shifts',
                'impact': shifts_needed * 1500,
                'feasibility': 0.8,
                'timeframe': f'{shifts_needed * 2} days'
            })
        
        # COMMUNICATION: Get savings info from Agent 3
        emergency_fund = self.savings_agent.get_fund_balance()
        
        if emergency_fund > 0:
            interventions.append({
                'type': 'use_emergency_fund',
                'action': f'Use emergency fund (₹{emergency_fund:.0f} available)',
                'impact': min(emergency_fund, deficit),
                'feasibility': 1.0,
                'timeframe': 'Instant',
                'warning': 'Will deplete emergency fund'
            })
        
        # Generate expense-cutting interventions
        cuttable = self._find_cuttable_expenses(deficit)
        if cuttable:
            interventions.append({
                'type': 'expense_reduction',
                'action': f'Cut non-essentials: {cuttable["items"]}',
                'impact': cuttable['total_savings'],
                'feasibility': 0.7,
                'timeframe': 'Immediate'
            })
        
        # INTELLIGENT: Rank by effectiveness
        interventions.sort(key=lambda x: x['impact'] * x['feasibility'], reverse=True)
        
        return interventions
    
    def simulate_decision(self, decision_type, decision_params):
        """
        BUTTERFLY EFFECT SIMULATOR
        Shows real-time impact of decisions
        """
        print(f"🦋 Simulating: {decision_type}")
        
        # Get current crisis state
        current_crisis = self.run_scenario_analysis()
        
        if not current_crisis:
            return {'message': 'No crisis to simulate'}
        
        # INTELLIGENT: Apply decision and recalculate
        modified_state = self._apply_decision(decision_type, decision_params)
        
        # Re-run analysis with modified state
        new_crisis = self._recalculate_with_changes(modified_state)
        
        # REACTIVE: Show the impact
        impact = {
            'before': {
                'probability': current_crisis['probability'],
                'days_to_crisis': current_crisis['days_to_crisis'],
                'deficit': current_crisis['deficit']
            },
            'after': {
                'probability': new_crisis['probability'] if new_crisis else 0,
                'days_to_crisis': new_crisis['days_to_crisis'] if new_crisis else None,
                'deficit': new_crisis['deficit'] if new_crisis else 0
            },
            'change': {
                'probability_delta': (new_crisis['probability'] if new_crisis else 0) - current_crisis['probability'],
                'risk_reduced': current_crisis['probability'] - (new_crisis['probability'] if new_crisis else 0) > 0
            }
        }
        
        return impact
    
    def _handle_crisis_detected(self, crisis_info):
        """
        REACTIVE + PROACTIVE: Respond and alert
        """
        self.state['active_crisis'] = crisis_info
        
        # Alert user
        self.db.save_crisis_alert(self.user_id, crisis_info)
        
        # COMMUNICATION: Tell Agent 3 to protect money
        self.savings_agent.activate_crisis_mode(crisis_info)
        
        # PROACTIVE: Start monitoring more frequently
        self.state['monitoring_frequency'] = 'high'
        
        print(f"🚨 CRISIS ALERT: {crisis_info['severity']} - {crisis_info['days_to_crisis']} days")
    
    def _should_run_analysis(self):
        """
        AUTONOMOUS: Decide when to check
        """
        # Run daily normally, every 6 hours during crisis
        pass
    
    def _simulate_scenario(self, income_stream, balance, bills, avg_expenses):
        """
        Simulate a scenario over the provided income_stream (daily amounts).
        Returns a dict with keys:
          - 'crisis': bool
          - 'days_to_crisis': int or None
          - 'deficit': float (amount short at crisis)
        """
        if not income_stream:
            return {'crisis': False, 'days_to_crisis': None, 'deficit': 0}

        current_balance = float(balance or 0.0)
        total_bills = sum(b.get('amount', 0) for b in (bills or []))
        # Spread bills evenly across period as a simple heuristic
        per_day_bills = (total_bills / len(income_stream)) if total_bills and len(income_stream) else 0.0

        for idx, income in enumerate(income_stream):
            # Add income, subtract typical expenses and the share of bills
            current_balance += float(income or 0.0)
            current_balance -= float(avg_expenses or 0.0)
            current_balance -= per_day_bills

            if current_balance < 0:
                # Crisis occurs on this day
                deficit = -current_balance
                return {
                    'crisis': True,
                    'days_to_crisis': idx + 1,
                    'deficit': float(deficit)
                }

        # No crisis detected in this scenario
        return {'crisis': False, 'days_to_crisis': None, 'deficit': 0}