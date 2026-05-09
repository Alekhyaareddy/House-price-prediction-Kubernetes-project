import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import os

def train_and_save_model():
    df = pd.read_csv('housing_price_dataset.csv')

    le = LabelEncoder()
    df['Neighborhood_encoded'] = le.fit_transform(df['Neighborhood'])

    features = ['SquareFeet', 'Bedrooms', 'Bathrooms', 'Neighborhood_encoded', 'YearBuilt']
    X = df[features]
    y = df['Price']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print(f"MAE: ${mae:,.2f}")
    print(f"RMSE: ${rmse:,.2f}")
    print(f"R² Score: {r2:.4f}")

    joblib.dump(model, 'model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    joblib.dump(le, 'label_encoder.pkl')

    # Save dataset stats for frontend
    stats = {
        'sqft_min': int(df['SquareFeet'].min()),
        'sqft_max': int(df['SquareFeet'].max()),
        'sqft_mean': float(df['SquareFeet'].mean()),
        'year_min': int(df['YearBuilt'].min()),
        'year_max': int(df['YearBuilt'].max()),
        'price_min': float(df['Price'].min()),
        'price_max': float(df['Price'].max()),
        'price_mean': float(df['Price'].mean()),
        'neighborhoods': df['Neighborhood'].unique().tolist(),
        'mae': float(mae),
        'r2': float(r2),
        'rmse': float(rmse),
        'total_records': len(df)
    }

    import json
    with open('model_stats.json', 'w') as f:
        json.dump(stats, f)

    print("Model saved successfully!")
    return stats

if __name__ == '__main__':
    train_and_save_model()
