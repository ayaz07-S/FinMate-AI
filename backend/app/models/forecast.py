"""
Simple forecasting logic (no Prophet dependency)
"""
import pandas as pd
import numpy as np


def generate_three_scenarios(income_data, periods=90):
    """
    Generate 3 financial futures using simple statistical methods
    
    Args:
        income_data: List of dicts [{'date': '2024-01-01', 'income': 450}, ...]
        periods: Number of days to forecast (default 90)
    
    Returns:
        dict with 3 scenarios: pessimistic, base, optimistic
    """
    df = pd.DataFrame(income_data)
    df.columns = ['ds', 'y']
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.sort_values('ds')
    
    print(f"📊 Generating forecast from {len(df)} days of income data...")
    
    # Calculate statistics
    mean_income = df['y'].mean()
    std_income = df['y'].std() if len(df) > 1 else mean_income * 0.2
    
    # Generate future dates
    last_date = df['ds'].iloc[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=periods)
    
    # Generate base forecast with some randomness
    np.random.seed(42)
    base_values = np.random.normal(mean_income, std_income * 0.3, periods)
    base_values = np.maximum(base_values, 0)  # No negative income
    
    scenarios = {
        'dates': future_dates.strftime('%Y-%m-%d').tolist(),
        'pessimistic': (base_values * 0.7).tolist(),
        'base': base_values.tolist(),
        'optimistic': (base_values * 1.3).tolist()
    }
    
    print("✅ Three scenarios generated!")
    print(f"   📉 Pessimistic avg: ₹{np.mean(scenarios['pessimistic']):.0f}/day")
    print(f"   📊 Base avg: ₹{np.mean(scenarios['base']):.0f}/day")
    print(f"   📈 Optimistic avg: ₹{np.mean(scenarios['optimistic']):.0f}/day")
    
    return scenarios