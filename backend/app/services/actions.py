"""
Action suggestion generation with impact calculation
"""


def generate_suggestions(crisis_info, current_income_avg=500):
    """
    Generate 3 actionable suggestions based on crisis severity
    
    Args:
        crisis_info: Crisis detection result
        current_income_avg: User's average daily income
    
    Returns:
        List of 3 suggestion dicts with impact calculations
    """
    
    if not crisis_info:
        # No crisis - suggest optimization actions
        return [
            {
                'id': 'optimize_1',
                'title': 'Save ₹100 daily',
                'impact': '+₹3,000/month',
                'description': 'Auto-lock ₹100 every evening',
                'action_type': 'SAVE',
                'butterfly_effect': 'Small daily saves = ₹36,000/year'
            },
            {
                'id': 'optimize_2',
                'title': 'Take 1 extra shift/week',
                'impact': '+₹1,600/month',
                'description': 'Work one Sunday shift per week',
                'action_type': 'EARN',
                'butterfly_effect': 'One shift = ₹19,200/year extra'
            },
            {
                'id': 'optimize_3',
                'title': 'Cut ₹50 non-essentials',
                'impact': '+₹1,500/month',
                'description': 'Skip one chai/snack per day',
                'action_type': 'CUT',
                'butterfly_effect': 'One chai less = ₹18,000/year saved'
            }
        ]
    
    # Crisis detected - generate urgent actions
    deficit = crisis_info['deficit_amount']
    days = crisis_info['days_to_crisis']
    
    # Calculate how much extra income needed per day
    daily_gap = deficit / days
    
    suggestions = [
        {
            'id': 'crisis_1',
            'title': 'Take 2 extra weekend shifts',
            'impact': f'+₹800 (covers {(800/deficit)*100:.0f}% of deficit)',
            'description': 'Work both Saturday & Sunday this week',
            'action_type': 'EARN',
            'butterfly_effect': f'₹800 shift = ₹{800 * 4:,}impact over 4 weeks',
            'urgency': 'HIGH'
        },
        {
            'id': 'crisis_2',
            'title': f'Cut ₹{daily_gap:.0f} daily expenses',
            'impact': f'+₹{daily_gap * days:.0f} (closes gap)',
            'description': 'Skip dining out, reduce non-essentials',
            'action_type': 'CUT',
            'butterfly_effect': f'Small cuts today = Crisis averted',
            'urgency': 'HIGH'
        },
        {
            'id': 'crisis_3',
            'title': 'Delay ₹1,200 payment',
            'impact': '+₹1,200 breathing room',
            'description': 'Negotiate payment extension with lender',
            'action_type': 'DELAY',
            'butterfly_effect': 'Buying time = Finding solutions',
            'urgency': 'MEDIUM'
        }
    ]
    
    return suggestions


def calculate_action_impact(action, scenarios, current_balance=0):
    """
    Calculate how an action changes the three scenarios
    
    Args:
        action: dict with action details
        scenarios: Current 3 scenarios
        current_balance: Starting balance
    
    Returns:
        Updated scenarios with action applied
    """
    
    # Parse action impact (e.g., "+₹800" -> 800)
    impact_str = action.get('impact', '+₹0')
    impact_value = int(''.join(filter(str.isdigit, impact_str.split()[0])))
    
    # Apply impact to all scenarios
    updated_scenarios = {}
    
    for scenario_name, values in scenarios.items():
        if scenario_name == 'dates':
            updated_scenarios['dates'] = values
            continue
        
        # Add action impact to each day's income
        if action['action_type'] == 'EARN':
            # One-time boost (spread over a week)
            updated_values = values.copy()
            boost_per_day = impact_value / 7
            for i in range(min(7, len(updated_values))):
                updated_values[i] += boost_per_day
            updated_scenarios[scenario_name] = updated_values
        
        elif action['action_type'] == 'CUT':
            # Daily savings (reduces expenses, effectively adds income)
            daily_savings = impact_value / 30
            updated_scenarios[scenario_name] = [v + daily_savings for v in values]
        
        elif action['action_type'] == 'SAVE':
            # Auto-save doesn't change income, but improves balance
            updated_scenarios[scenario_name] = values  # Same income
        
        else:
            updated_scenarios[scenario_name] = values
    
    return updated_scenarios