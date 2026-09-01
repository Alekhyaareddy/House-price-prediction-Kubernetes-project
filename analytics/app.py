from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "Analytics Service is running"
    })

@app.route("/analytics")
def analytics():
    return jsonify({
        "average_price": 224827.33,
        "average_price_per_sqft": 107.02,
        "total_properties": 1000,
        "message": "Analytics data retrieved successfully"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
