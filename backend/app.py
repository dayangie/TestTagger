from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

from auth.db import db
from auth.routes import auth_bp
from auth.models import User
from classify import classify_test_case

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


app.register_blueprint(auth_bp)

with app.app_context():
    db.create_all()

@app.route('/classify', methods=['POST'])
def classify():
    data = request.json
    text = data.get('text', '')
    labels = data.get('labels', [])

    if not text or not labels:
        return jsonify({'error': 'Text and labels are required'}), 400

    result = classify_test_case(text, labels)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
