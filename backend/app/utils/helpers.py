"""
Data processing helpers
"""
import pandas as pd

def validate_csv(df):
    """Validate uploaded CSV format"""
    required_columns = ['date', 'income']
    return all(col in df.columns for col in required_columns)

def clean_income_data(df):
    """Clean and prepare income data"""
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    return df
