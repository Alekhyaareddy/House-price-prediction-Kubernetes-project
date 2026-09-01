
from flask import Flask, request, jsonify
from flask_cors import CORS
from prometheus_flask_exporter import PrometheusMetrics
import pandas as pd
import numpy as np
import joblib
import json

app = Flask(__name__)
CORS(app)
metrics = PrometheusMetrics(app)


# Load ML model artifacts
model = joblib.load('model.pkl')
scaler = joblib.load('scaler.pkl')
label_encoder = joblib.load('label_encoder.pkl')

# Load model statistics
with open('model_stats.json', 'r') as f:
    model_stats = json.load(f)

# Load dataset for house comparisons
df = pd.read_csv('housing_price_dataset.csv')


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'message': 'Prediction Service is running'
    })


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        square_feet = float(data['SquareFeet'])
        bedrooms = int(data['Bedrooms'])
        bathrooms = int(data['Bathrooms'])
        neighborhood = data['Neighborhood']
        year_built = int(data['YearBuilt'])

        # Encode neighborhood
        neighborhood_encoded = label_encoder.transform([neighborhood])[0]

        # Prepare features
        features = np.array([[
            square_feet,
            bedrooms,
            bathrooms,
            neighborhood_encoded,
            year_built
        ]])

        # Scale features
        features_scaled = scaler.transform(features)

        # Predict house price
        prediction = model.predict(features_scaled)[0]

        # Find similar houses
        df['distance'] = (
            ((df['SquareFeet'] - square_feet) / df['SquareFeet'].std()) ** 2 +
            ((df['Bedrooms'] - bedrooms) /
             max(df['Bedrooms'].std(), 0.01)) ** 2 +
            ((df['Bathrooms'] - bathrooms) /
             max(df['Bathrooms'].std(), 0.01)) ** 2 +
            ((df['YearBuilt'] - year_built) /
             df['YearBuilt'].std()) ** 2
        )

        similar = df[
            df['Neighborhood'] == neighborhood
        ].nsmallest(5, 'distance')[
            ['SquareFeet', 'Bedrooms', 'Bathrooms', 'YearBuilt', 'Price']
        ].to_dict('records')

        # Price range
        price_low = prediction * 0.92
        price_high = prediction * 1.08

        # Price per square foot
        price_per_sqft = prediction / square_feet

        # Neighborhood average
        neighborhood_avg = df[
            df['Neighborhood'] == neighborhood
        ]['Price'].mean()

        # Overall market average
        overall_avg = df['Price'].mean()

        return jsonify({
            'predicted_price': round(prediction, 2),
            'price_low': round(price_low, 2),
            'price_high': round(price_high, 2),
            'price_per_sqft': round(price_per_sqft, 2),
            'neighborhood_avg': round(neighborhood_avg, 2),
            'overall_avg': round(overall_avg, 2),
            'similar_houses': similar,
            'vs_neighborhood': round(
                (prediction / neighborhood_avg - 1) * 100, 1
            ),
            'vs_market': round(
                (prediction / overall_avg - 1) * 100, 1
            ),
            'model_accuracy': round(
                model_stats['r2'] * 100, 1
            )
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
