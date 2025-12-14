from flask import Blueprint, jsonify, request
from models.database_model import DatabaseModel

database_bp = Blueprint('database', __name__)

@database_bp.route('', methods=['GET'])
def get_databases():
    """Get all databases"""
    try:
        databases = DatabaseModel.get_all_databases()
        return jsonify({'success': True, 'databases': databases})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@database_bp.route('', methods=['POST'])
def create_database():
    """Create a new database"""
    try:
        data = request.get_json()
        database_name = data.get('name')
        
        if not database_name:
            return jsonify({'success': False, 'error': 'Database name is required'}), 400
        
        DatabaseModel.create_database(database_name)
        return jsonify({'success': True, 'message': f'Database {database_name} created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@database_bp.route('/<database_name>', methods=['DELETE'])
def drop_database(database_name):
    """Drop a database"""
    try:
        DatabaseModel.drop_database(database_name)
        return jsonify({'success': True, 'message': f'Database {database_name} dropped successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@database_bp.route('/<database_name>/tables', methods=['GET'])
def get_tables(database_name):
    """Get all tables in a database"""
    try:
        tables = DatabaseModel.get_tables(database_name)
        return jsonify({'success': True, 'tables': tables})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@database_bp.route('/<database_name>/tables', methods=['POST'])
def create_table(database_name):
    """Create a new table"""
    try:
        data = request.get_json()
        table_name = data.get('name')
        columns = data.get('columns')
        
        if not table_name or not columns:
            return jsonify({'success': False, 'error': 'Table name and columns are required'}), 400
        
        DatabaseModel.create_table(database_name, table_name, columns)
        return jsonify({'success': True, 'message': f'Table {table_name} created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@database_bp.route('/<database_name>/tables/<table_name>', methods=['DELETE'])
def drop_table(database_name, table_name):
    """Drop a table"""
    try:
        DatabaseModel.drop_table(database_name, table_name)
        return jsonify({'success': True, 'message': f'Table {table_name} dropped successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@database_bp.route('/<database_name>/tables/<table_name>/structure', methods=['GET'])
def get_table_structure(database_name, table_name):
    """Get table structure"""
    try:
        structure = DatabaseModel.get_table_structure(database_name, table_name)
        return jsonify({'success': True, 'structure': structure})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
