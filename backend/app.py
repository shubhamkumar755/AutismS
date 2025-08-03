from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session
CORS(app)  # Enable CORS for frontend integration

# Load model and encoders
try:
    model = pickle.load(open("best_model.pkl", "rb"))
    encoders = pickle.load(open("encoders.pkl", "rb"))
except FileNotFoundError:
    print("Warning: Model files not found. Please ensure best_model.pkl and encoders.pkl are in the backend directory.")
    model = None
    encoders = None

@app.route('/')
def home():
    return jsonify({
        'status': 'Backend is running',
        'message': 'Autism Predictor Backend is active'
    })

@app.route("/test", methods=["POST"])
def test():
    print("=== TEST ENDPOINT ===")
    print("Request method:", request.method)
    print("Request content type:", request.content_type)
    print("Request headers:", dict(request.headers))
    print("Request form data:", dict(request.form))
    print("Request JSON data:", request.get_json(silent=True))
    print("Request files:", dict(request.files))
    print("====================")
    
    return jsonify({
        'success': True,
        'message': 'Test endpoint working',
        'received_data': dict(request.form)
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        print("Request method:", request.method)
        print("Request content type:", request.content_type)
        print("Request headers:", dict(request.headers))
        
        # Handle different content types
        if request.content_type and 'application/json' in request.content_type:
            # Handle JSON data
            data = request.get_json()
            print("Received JSON data:", data)
        else:
            # Handle form data
            print("Received form data:", dict(request.form))
            data = dict(request.form)
        
        # Validate required fields
        required_fields = ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 
                          'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score',
                          'age', 'gender', 'ethnicity', 'jaundice', 'familyAutism', 
                          'country', 'usedApp', 'aqScore', 'relation']
        
        print("Received data keys:", list(data.keys()))
        print("Expected required fields:", required_fields)
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {missing_fields}',
                'message': f'Missing required fields: {missing_fields}',
                'received_fields': list(data.keys()),
                'expected_fields': required_fields
            }), 400
        
        # Check for empty values
        empty_fields = [field for field in required_fields if field in data and (data[field] == '' or data[field] is None)]
        if empty_fields:
            print(f"Empty fields: {empty_fields}")
            return jsonify({
                'success': False,
                'error': f'Empty required fields: {empty_fields}',
                'message': f'Empty required fields: {empty_fields}'
            }), 400
        
        # Convert 0/1 strings to integers for A1-A10 scores
        processed_data = {
            'A1_Score': int(data['A1_Score']),
            'A2_Score': int(data['A2_Score']),
            'A3_Score': int(data['A3_Score']),
            'A4_Score': int(data['A4_Score']),
            'A5_Score': int(data['A5_Score']),
            'A6_Score': int(data['A6_Score']),
            'A7_Score': int(data['A7_Score']),
            'A8_Score': int(data['A8_Score']),
            'A9_Score': int(data['A9_Score']),
            'A10_Score': int(data['A10_Score']),
            'age': int(data['age']),
            'gender': data['gender'],
            'ethnicity': data['ethnicity'],
            'jaundice': data['jaundice'],
            'austim': data['familyAutism'],  # Map familyAutism to austim
            'contry_of_res': data['country'],  # Map country to contry_of_res
            'used_app_before': data['usedApp'],  # Map usedApp to used_app_before
            'result': float(data['aqScore']),  # Map aqScore to result
            'relation': data['relation']
        }
        
        print("Processed data:", processed_data)

        df = pd.DataFrame([processed_data])
        print("DataFrame shape:", df.shape)

        # Encode categorical columns
        categorical_columns = ['gender', 'ethnicity', 'jaundice', 'austim', 'contry_of_res', 'used_app_before', 'relation']
        for col in categorical_columns:
            if col in encoders:
                print(f"Encoding column: {col}")
                df[col] = encoders[col].transform(df[col])
            else:
                print(f"Warning: No encoder found for column {col}")

        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded',
                'message': 'Model files are missing. Please ensure best_model.pkl is in the backend directory.'
            }), 500

        prediction = model.predict(df)[0]
        result = "ASD Positive" if prediction == 1 else "ASD Negative"
        
        print(f"Prediction result: {result}")
        
        return jsonify({
            'success': True,
            'prediction': result,
            'message': f"Prediction: {result}"
        })
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': f'An error occurred during prediction: {str(e)}'
        }), 500

@app.route("/api/health")
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'encoders_loaded': encoders is not None
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 