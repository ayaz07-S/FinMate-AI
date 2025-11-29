# agents/income_agent.py
import numpy as np
import datetime 
class IncomeAgent:
    """
    Agent 1: Income Predictor
    Autonomously analyzes income patterns and predicts futures
    """
    
    def __init__(self, user_id, db):
        self.user_id = user_id
        self.db = db
        self.state = {
            'last_analysis': None,
            'confidence_level': 0,
            'income_pattern': None  # 'fixed', 'variable', 'mixed'
        }
        self.message_bus = []  # To communicate with other agents
    
    def analyze_income_pattern(self):
        """
        AUTONOMOUS: Automatically classifies income type
        """
        transactions = self.db.get_transactions(self.user_id, days=60)
        income_txns = [t for t in transactions if t['type'] == 'income']
        
        if not income_txns:
            return None
        
        amounts = [t['amount'] for t in income_txns]
        std_dev = np.std(amounts)
        mean = np.mean(amounts)
        
        # DECISION MAKING: Classify pattern
        coefficient_of_variation = std_dev / mean if mean > 0 else 0
        
        if coefficient_of_variation < 0.1:
            pattern = 'fixed'
            confidence = 0.9
        elif coefficient_of_variation > 0.4:
            pattern = 'variable'
            confidence = 0.7
        else:
            pattern = 'mixed'
            confidence = 0.8
        
        self.state['income_pattern'] = pattern
        self.state['confidence_level'] = confidence
        
        # PROACTIVE: Alert other agents about pattern
        self._broadcast_message({
            'from': 'income_agent',
            'type': 'pattern_detected',
            'data': {
                'pattern': pattern,
                'confidence': confidence,
                'recommendation': self._get_pattern_advice(pattern)
            }
        })
        
        return pattern
    
    def predict_scenarios(self, days=14):
        """
        GOAL-ORIENTED: Generate predictions to help user plan
        """
        print(f"🎯 Income Agent: Analyzing {days}-day outlook for user {self.user_id}")

        # Ensure income pattern is classified
        if not self.state.get('income_pattern'):
            try:
                self.analyze_income_pattern()
            except Exception:
                pass

        # Get historical data
        income_data = self._get_income_history()

        # If insufficient data, use a simple fallback prediction
        if not income_data or len(income_data) < 3:
            return self._fallback_simple_prediction(days)

        # Use a lightweight statistical forecast (no external Prophet dependency)
        try:
            scenarios = self._prophet_forecast(income_data, days)
            self.state['last_analysis'] = datetime.datetime.now()

            # CONTEXT AWARE: Adjust based on pattern
            if self.state.get('income_pattern') == 'variable':
                # Widen pessimistic scenario for variable income
                scenarios['pessimistic'] = [max(0.0, p * 0.8) for p in scenarios['pessimistic']]

            # PROACTIVE: Warn if lean period ahead
            avg_predicted = np.mean(scenarios['base'])
            avg_historical = np.mean([d['income'] for d in income_data])

            if avg_predicted < avg_historical * 0.85:
                self._broadcast_message({
                    'from': 'income_agent',
                    'type': 'lean_period_warning',
                    'data': {
                        'severity': 'HIGH',
                        'message': f"Lean period ahead: {avg_predicted:.0f} vs usual {avg_historical:.0f}",
                        'recommendation': 'Prepare for lower income next 2 weeks'
                    }
                })

            return scenarios
        except Exception as e:
            print(f"⚠️ Forecast failed: {e}, using fallback")
            return self._fallback_simple_prediction(days)
    
    def get_point_of_no_return(self, bills_upcoming):
        """
        INTELLIGENT: Calculate minimum income needed
        """
        total_bills = sum(bill['amount'] for bill in bills_upcoming)
        
        # DECISION: What's the absolute minimum?
        minimum_income = total_bills * 1.15  # Bills + 15% buffer
        
        # Check against predictions
        scenarios = self.predict_scenarios(30)
        pessimistic_total = sum(scenarios['pessimistic'])
        
        if pessimistic_total < minimum_income:
            # REACTIVE: Danger detected, alert crisis agent
            self._broadcast_message({
                'from': 'income_agent',
                'to': 'crisis_agent',
                'type': 'point_of_no_return',
                'data': {
                    'minimum_needed': minimum_income,
                    'pessimistic_prediction': pessimistic_total,
                    'shortfall': minimum_income - pessimistic_total,
                    'severity': 'CRITICAL'
                }
            })
        
        return {
            'minimum_income': minimum_income,
            'pessimistic_prediction': pessimistic_total,
            'safe': pessimistic_total >= minimum_income
        }
    
    def _broadcast_message(self, message):
        """
        COMMUNICATION: Talk to other agents
        """
        self.message_bus.append(message)
        print(f"📨 Income Agent → {message['type']}")
    
    def _get_pattern_advice(self, pattern):
        """
        GOAL-ORIENTED: Give specific advice based on pattern
        """
        advice = {
            'fixed': 'Predictable income detected. Crisis prevention is straightforward.',
            'variable': 'High income variability. Recommend larger emergency fund.',
            'mixed': 'Mixed income pattern. Plan around base salary, save variable portion.'
        }
        return advice.get(pattern, 'Unknown pattern')
    
    def _prophet_forecast(self, income_data, periods):
        # Lightweight statistical forecast (moving average + simple trend)
        # income_data: list of {'date', 'income'}
        amounts = [d['income'] for d in income_data]
        if not amounts:
            raise ValueError('No income data for forecasting')

        # Use recent window to compute base level and trend
        window = amounts[-30:] if len(amounts) >= 30 else amounts
        mean = float(np.mean(window))
        x = np.arange(len(window))
        if len(x) > 1:
            slope = float(np.polyfit(x, window, 1)[0])
        else:
            slope = 0.0

        base = []
        for i in range(1, periods + 1):
            val = mean + slope * i
            base.append(max(0.0, float(val)))

        optimistic = [b * 1.2 for b in base]
        pessimistic = [b * 0.8 for b in base]

        return {
            'base': base,
            'optimistic': optimistic,
            'pessimistic': pessimistic
        }

    def _get_income_history(self):
        """
        Retrieve and normalize income history from the DB for this user.
        Returns list of dicts: {'date': 'YYYY-MM-DD', 'income': float}
        """
        txns = self.db.get_transactions(self.user_id, days=365)
        income_txns = [t for t in txns if t.get('type') == 'income']
        if not income_txns:
            return []

        # Normalize and sort by date
        normalized = []
        for t in income_txns:
            d = t.get('date')
            amt = t.get('amount', 0.0)
            # Some stored rows may already be strings
            try:
                # Keep string dates as-is (frontend stores 'YYYY-MM-DD')
                normalized.append({'date': str(d), 'income': float(amt)})
            except Exception:
                continue

        # Sort by date ascending
        try:
            normalized.sort(key=lambda x: x['date'])
        except Exception:
            pass

        return normalized
    
    def _fallback_simple_prediction(self, days):
        # Simple fallback: repeat recent average with +/- bands
        transactions = self.db.get_transactions(self.user_id, days=60)
        income_txns = [t for t in transactions if t['type'] == 'income']
        amounts = [t['amount'] for t in income_txns]

        if not amounts:
            # No data at all: return small default numbers
            base_val = 1000.0
        else:
            base_val = float(np.mean(amounts[-14:])) if len(amounts) >= 1 else float(np.mean(amounts))

        base = [max(0.0, base_val) for _ in range(days)]
        optimistic = [b * 1.15 for b in base]
        pessimistic = [b * 0.85 for b in base]

        return {
            'base': base,
            'optimistic': optimistic,
            'pessimistic': pessimistic
        }