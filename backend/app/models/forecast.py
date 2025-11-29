"""
Simple forecasting logic (no Prophet dependency)
"""
import pandas as pd
import numpy as np
from datetime import datetime


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
    print(f"   📅 Date range: {df['ds'].min().date()} to {df['ds'].max().date()}")
    
    # Calculate statistics FROM YOUR DATA
    mean_income = df['y'].mean()
    std_income = df['y'].std() if len(df) > 1 else mean_income * 0.2
    min_income = df['y'].min()
    max_income = df['y'].max()
    
    print(f"   💰 Your income stats: mean=₹{mean_income:.0f}, std=₹{std_income:.0f}")
    print(f"   📉 Range: ₹{min_income:.0f} - ₹{max_income:.0f}")
    
    # Generate future dates
    last_date = df['ds'].iloc[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=periods)
    
    # Use time-based seed so results vary each time (but reproducible within same second)
    seed = int(datetime.now().timestamp()) % 10000
    np.random.seed(seed)
    
    # Generate base forecast with YOUR income patterns
    # Add weekly patterns (weekends might differ)
    base_values = []
    for i in range(periods):
        # Base: your mean income with natural variation
        day_of_week = (future_dates[i].dayofweek)
        
        # Weekend adjustment (example: might earn more or less)
        weekend_factor = 0.85 if day_of_week >= 5 else 1.0
        
        # Random daily variation based on YOUR actual variance
        daily_value = np.random.normal(mean_income * weekend_factor, std_income * 0.5)
        daily_value = max(daily_value, min_income * 0.5)  # Floor at half your min
        daily_value = min(daily_value, max_income * 1.2)  # Cap at 120% your max
        base_values.append(daily_value)
    
    base_values = np.array(base_values)
    
    # Pessimistic: 70% of base (bad days, fewer gigs)
    pessimistic_values = base_values * 0.7
    
    # Optimistic: 130% of base (good days, more gigs, tips)
    optimistic_values = base_values * 1.3
    
    scenarios = {
        'dates': future_dates.strftime('%Y-%m-%d').tolist(),
        'pessimistic': pessimistic_values.tolist(),
        'base': base_values.tolist(),
        'optimistic': optimistic_values.tolist()
    }
    
    print("✅ Three scenarios generated FROM YOUR DATA!")
    print(f"   📉 Pessimistic avg: ₹{np.mean(scenarios['pessimistic']):.0f}/day")
    print(f"   📊 Base avg: ₹{np.mean(scenarios['base']):.0f}/day")
    print(f"   📈 Optimistic avg: ₹{np.mean(scenarios['optimistic']):.0f}/day")
    
    return scenarios