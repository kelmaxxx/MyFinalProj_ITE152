from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from config import Config
from controllers.database_controller import database_bp
from controllers.backup_controller import backup_bp
from controllers.user_controller import user_bp

app = Flask(__name__, static_folder='static', static_url_path='')
app.config.from_object(Config)
CORS(app)

# Register blueprints
app.register_blueprint(database_bp, url_prefix='/api/databases')
app.register_blueprint(backup_bp, url_prefix='/api/backups')
app.register_blueprint(user_bp, url_prefix='/api/users')

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'MySQL DBMS API is running'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Ensure backup directory exists
    os.makedirs(app.config['BACKUP_DIR'], exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
