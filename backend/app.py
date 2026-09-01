
from flask import Flask, request, jsonify
from prometheus_flask_exporter import PrometheusMetrics
from flask_cors import CORS
import pandas as pd
import json
import os
import requests

app = Flask(__name__)
metrics = PrometheusMetrics(app)
CORS(app)

# Prediction Service URL
PREDICTION_SERVICE_URL = os.getenv(
    'PREDICTION_SERVICE_URL',
    'http://prediction-service:5000'
)
# Analytics Service URL
ANALYTICS_SERVICE_URL = os.getenv(
    'ANALYTICS_SERVICE_URL',
    'http://analytics-service:5000'
)

# Load model statistics
with open('model_stats.json', 'r') as f:
    model_stats = json.load(f)

# Load dataset for comparisons and charts
df = pd.read_csv('housing_price_dataset.csv')


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'message': 'House Price Prediction API is running'
    })


@app.route('/stats', methods=['GET'])
def stats():
    return jsonify(model_stats)
@app.route('/analytics', methods=['GET'])
def analytics():
    try:
        response = requests.get(
            f'{ANALYTICS_SERVICE_URL}/analytics',
            timeout=10
        )

        response.raise_for_status()

        return jsonify(response.json())

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Send prediction request to Prediction Service
        prediction_response = requests.post(
            f'{PREDICTION_SERVICE_URL}/predict',
            json=data,
            timeout=30
        )

        prediction_response.raise_for_status()

        # Return prediction service response directly
        return jsonify(prediction_response.json())

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
            'range': f"${int(interval.left / 1000)}k-${int(interval.right / 1000)}k",
            'count': int(count)
        }
        for interval, count in dist.items()
    ]

    sqft_price = filtered[
        ['SquareFeet', 'Price', 'Neighborhood']
    ].sample(
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
    app.run(host='0.0.0.0', port=5000)

