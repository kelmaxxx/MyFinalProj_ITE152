from flask import Blueprint, jsonify, request
from models.user_model import UserModel

user_bp = Blueprint('user', __name__)

@user_bp.route('', methods=['GET'])
def get_users():
    """Get all MySQL users"""
    try:
        users = UserModel.get_all_users()
        return jsonify({'success': True, 'users': users})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('', methods=['POST'])
def create_user():
    """Create a new MySQL user"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        host = data.get('host', 'localhost')
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password are required'}), 400
        
        UserModel.create_user(username, password, host)
        return jsonify({
            'success': True, 
            'message': f'User {username}@{host} created successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/<username>', methods=['DELETE'])
def drop_user(username):
    """Drop a MySQL user"""
    try:
        host = request.args.get('host', 'localhost')
        UserModel.drop_user(username, host)
        return jsonify({
            'success': True, 
            'message': f'User {username}@{host} dropped successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/<username>/privileges', methods=['GET'])
def get_privileges(username):
    """Get user privileges"""
    try:
        host = request.args.get('host', 'localhost')
        privileges = UserModel.get_user_privileges(username, host)
        return jsonify({'success': True, 'privileges': privileges})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/<username>/privileges/grant', methods=['POST'])
def grant_privileges(username):
    """Grant privileges to user"""
    try:
        data = request.get_json()
        host = data.get('host', 'localhost')
        database = data.get('database')
        privileges = data.get('privileges')
        
        if not database or not privileges:
            return jsonify({'success': False, 'error': 'Database and privileges are required'}), 400
        
        UserModel.grant_privileges(username, host, database, privileges)
        return jsonify({
            'success': True, 
            'message': 'Privileges granted successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/<username>/privileges/revoke', methods=['POST'])
def revoke_privileges(username):
    """Revoke privileges from user"""
    try:
        data = request.get_json()
        host = data.get('host', 'localhost')
        database = data.get('database')
        privileges = data.get('privileges')
        
        if not database or not privileges:
            return jsonify({'success': False, 'error': 'Database and privileges are required'}), 400
        
        UserModel.revoke_privileges(username, host, database, privileges)
        return jsonify({
            'success': True, 
            'message': 'Privileges revoked successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
