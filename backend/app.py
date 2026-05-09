from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import json
import os

app = Flask(__name__)
CORS(app)

# Load model artifacts
model = joblib.load('model.pkl')
scaler = joblib.load('scaler.pkl')
label_encoder = joblib.load('label_encoder.pkl')

with open('model_stats.json', 'r') as f:
    model_stats = json.load(f)

# Load dataset for comparisons and charts
df = pd.read_csv('housing_price_dataset.csv')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'House Price Prediction API is running'})

@app.route('/stats', methods=['GET'])
def stats():
    return jsonify(model_stats)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        square_feet = float(data['SquareFeet'])
        bedrooms = int(data['Bedrooms'])
        bathrooms = int(data['Bathrooms'])
        neighborhood = data['Neighborhood']
        year_built = int(data['YearBuilt'])

        neighborhood_encoded = label_encoder.transform([neighborhood])[0]

        features = np.array([[square_feet, bedrooms, bathrooms, neighborhood_encoded, year_built]])
        features_scaled = scaler.transform(features)

        prediction = model.predict(features_scaled)[0]

        # Find similar houses
        df['distance'] = (
            ((df['SquareFeet'] - square_feet) / df['SquareFeet'].std()) ** 2 +
            ((df['Bedrooms'] - bedrooms) / max(df['Bedrooms'].std(), 0.01)) ** 2 +
            ((df['Bathrooms'] - bathrooms) / max(df['Bathrooms'].std(), 0.01)) ** 2 +
            ((df['YearBuilt'] - year_built) / df['YearBuilt'].std()) ** 2
        )
        similar = df[df['Neighborhood'] == neighborhood].nsmallest(5, 'distance')[
            ['SquareFeet', 'Bedrooms', 'Bathrooms', 'YearBuilt', 'Price']
        ].to_dict('records')

        # Price range (confidence band)
        price_low = prediction * 0.92
        price_high = prediction * 1.08

        # Price per sqft
        price_per_sqft = prediction / square_feet

        # Neighborhood avg comparison
        neighborhood_avg = df[df['Neighborhood'] == neighborhood]['Price'].mean()
        overall_avg = df['Price'].mean()

        # Price breakdown by factor
        neighborhood_premium = {
            'Urban': 1.15,
            'Suburb': 1.08,
            'Rural': 0.88
        }.get(neighborhood, 1.0)

        age_factor = max(0.7, 1.0 - (2026 - year_built) * 0.003)

        return jsonify({
            'predicted_price': round(prediction, 2),
            'price_low': round(price_low, 2),
            'price_high': round(price_high, 2),
            'price_per_sqft': round(price_per_sqft, 2),
            'neighborhood_avg': round(neighborhood_avg, 2),
            'overall_avg': round(overall_avg, 2),
            'similar_houses': similar,
            'vs_neighborhood': round((prediction / neighborhood_avg - 1) * 100, 1),
            'vs_market': round((prediction / overall_avg - 1) * 100, 1),
            'model_accuracy': round(model_stats['r2'] * 100, 1)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/dataset/distribution', methods=['GET'])
def distribution():
    neighborhood = request.args.get('neighborhood', 'all')

    if neighborhood != 'all':
        filtered = df[df['Neighborhood'] == neighborhood]
    else:
        filtered = df

    bins = pd.cut(filtered['Price'], bins=10)
    dist = bins.value_counts().sort_index()

    price_dist = [
        {
            'range': f"${int(interval.left/1000)}k-${int(interval.right/1000)}k",
            'count': int(count)
        }
        for interval, count in dist.items()
    ]

    sqft_price = filtered[['SquareFeet', 'Price', 'Neighborhood']].sample(
        min(200, len(filtered))
    ).to_dict('records')

    neighborhood_stats = df.groupby('Neighborhood').agg(
        avg_price=('Price', 'mean'),
        count=('Price', 'count'),
        min_price=('Price', 'min'),
        max_price=('Price', 'max')
    ).reset_index().to_dict('records')

    return jsonify({
        'price_distribution': price_dist,
        'scatter_data': sqft_price,
        'neighborhood_stats': neighborhood_stats
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
