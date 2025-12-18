from models.database_model import DatabaseModel

class UserModel:
    
    @staticmethod
    def get_all_users():
        """Get all MySQL users (excluding system users)"""
        connection = None
        try:
            connection = DatabaseModel.get_connection('mysql')
            cursor = connection.cursor()
            cursor.execute("SELECT User, Host FROM user WHERE User != '' AND User NOT IN ('mysql.sys', 'mysql.session', 'mysql.infoschema')")
            users = [{'username': row[0], 'host': row[1]} for row in cursor.fetchall()]
            return users
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def create_user(username, password=None, host='localhost'):
        """Create a new MySQL user"""
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            
            # Create user with or without password
            if password:
                cursor.execute(f"CREATE USER '{username}'@'{host}' IDENTIFIED BY '{password}'")
            else:
                cursor.execute(f"CREATE USER '{username}'@'{host}'")
            
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def drop_user(username, host='localhost'):
        """Drop a MySQL user"""
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            cursor.execute(f"DROP USER '{username}'@'{host}'")
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def get_user_privileges(username, host='localhost'):
        """Get privileges for a user"""
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            cursor.execute(f"SHOW GRANTS FOR '{username}'@'{host}'")
            grants = [row[0] for row in cursor.fetchall()]
            return grants
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def grant_privileges(username, host, database, privileges):
        """Grant privileges to user on database"""
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            
            priv_str = ', '.join(privileges)
            query = f"GRANT {priv_str} ON `{database}`.* TO '{username}'@'{host}'"
            
            cursor.execute(query)
            cursor.execute("FLUSH PRIVILEGES")
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def revoke_privileges(username, host, database, privileges):
        """Revoke privileges from user on database"""
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            
            priv_str = ', '.join(privileges)
            query = f"REVOKE {priv_str} ON `{database}`.* FROM '{username}'@'{host}'"
            
            cursor.execute(query)
            cursor.execute("FLUSH PRIVILEGES")
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
