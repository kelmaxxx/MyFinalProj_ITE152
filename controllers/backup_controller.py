from flask import Blueprint, jsonify, request
from models.backup_model import BackupModel

backup_bp = Blueprint('backup', __name__)

@backup_bp.route('/metadata', methods=['GET'])
def get_metadata():
    """Get all backup metadata"""
    try:
        metadata = BackupModel.get_metadata()
        return jsonify({'success': True, 'backups': metadata})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@backup_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get backup statistics"""
    try:
        stats = BackupModel.get_backup_stats()
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@backup_bp.route('', methods=['POST'])
def create_backup():
    """Create a new backup"""
    try:
        data = request.get_json()
        database = data.get('database')
        table = data.get('table')
        
        if not database:
            return jsonify({'success': False, 'error': 'Database name is required'}), 400
        
        result = BackupModel.backup_database(database, table)
        return jsonify({
            'success': True, 
            'message': 'Backup created successfully',
            'backup': result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@backup_bp.route('/restore', methods=['POST'])
def restore_backup():
    """Restore from backup"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        target_database = data.get('target_database')
        
        if not filename:
            return jsonify({'success': False, 'error': 'Filename is required'}), 400
        
        BackupModel.restore_backup(filename, target_database)
        return jsonify({
            'success': True, 
            'message': 'Database restored successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@backup_bp.route('/<filename>', methods=['DELETE'])
def delete_backup(filename):
    """Delete a backup file"""
    try:
        BackupModel.delete_backup(filename)
        return jsonify({
            'success': True, 
            'message': 'Backup deleted successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
