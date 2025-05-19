from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from PIL import Image
import numpy as np
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet18
import torch.nn as nn

app = Flask(__name__)

# Configure upload folder (create if it doesn't exist)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Simple disease classes (replace with your actual classes)
DISEASE_CLASSES = [
    "Early Blight",
    "Late Blight",
    "Healthy",
    "Powdery Mildew",
    "Leaf Spot"
]

# Load a pre-trained model (replace with your actual model)
def load_model():
    model = resnet18(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(DISEASE_CLASSES))  # Adjust for our number of classes
    # In a real app, you would load your trained weights here
    # model.load_state_dict(torch.load('path_to_your_model.pth'))
    model.eval()
    return model

model = load_model()

# Image preprocessing
def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    image = Image.open(image_path).convert('RGB')
    return transform(image).unsqueeze(0)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        try:
            # Save the uploaded file temporarily
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Preprocess and predict
            input_tensor = preprocess_image(filepath)
            
            with torch.no_grad():
                output = model(input_tensor)
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
                confidence, pred_class = torch.max(probabilities, 0)
                confidence = confidence.item()
                pred_class = pred_class.item()
                
            # Clean up - remove the temporary file
            os.remove(filepath)
            
            return jsonify({
                "disease": DISEASE_CLASSES[pred_class],
                "confidence": confidence,
                "status": "success"
            })
            
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to process image",
                "error": str(e)
            }), 500
            
    else:
        return jsonify({"error": "Invalid file type"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)