from flask import Flask
from flask_cors import CORS
from routes.api import api_bp

def create_app():
    app = Flask(__name__, static_folder='static',template_folder='templates')
    
    CORS(app)

    app.register_blueprint(api_bp)

    return app