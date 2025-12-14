"""
Database Model - Handles database operations
"""

import mysql.connector
from mysql.connector import Error
from config import Config

class DatabaseModel:
    
    @staticmethod
    def get_connection(database=None):
        """Create and return MySQL connection"""
        try:
            connection = mysql.connector.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                port=Config.MYSQL_PORT,
                database=database
            )
            return connection
        except Error as e:
            raise Exception(f"Database connection failed: {str(e)}")
    
    @staticmethod
    def get_all_databases():
        """Get list of all databases"""
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            cursor.execute("SHOW DATABASES")
            databases = [db[0] for db in cursor.fetchall() 
                        if db[0] not in Config.SYSTEM_DATABASES]
            return databases
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def create_database(database_name):
        """Create a new database"""
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            cursor.execute(f"CREATE DATABASE `{database_name}`")
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def drop_database(database_name):
        """Drop a database"""
        if database_name in Config.SYSTEM_DATABASES:
            raise Exception("Cannot drop system database")
        
        connection = None
        try:
            connection = DatabaseModel.get_connection()
            cursor = connection.cursor()
            cursor.execute(f"DROP DATABASE `{database_name}`")
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def get_tables(database_name):
        """Get all tables in a database"""
        connection = None
        try:
            connection = DatabaseModel.get_connection(database_name)
            cursor = connection.cursor()
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            return tables
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def create_table(database_name, table_name, columns):
        """Create a new table with columns"""
        connection = None
        try:
            connection = DatabaseModel.get_connection(database_name)
            cursor = connection.cursor()
            
            column_defs = ', '.join([f"`{col['name']}` {col['type']}" for col in columns])
            query = f"CREATE TABLE `{table_name}` ({column_defs})"
            
            cursor.execute(query)
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def drop_table(database_name, table_name):
        """Drop a table"""
        connection = None
        try:
            connection = DatabaseModel.get_connection(database_name)
            cursor = connection.cursor()
            cursor.execute(f"DROP TABLE `{table_name}`")
            connection.commit()
            return True
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
    
    @staticmethod
    def get_table_structure(database_name, table_name):
        """Get table structure"""
        connection = None
        try:
            connection = DatabaseModel.get_connection(database_name)
            cursor = connection.cursor()
            cursor.execute(f"DESCRIBE `{table_name}`")
            columns = cursor.fetchall()
            
            structure = []
            for col in columns:
                structure.append({
                    'field': col[0],
                    'type': col[1],
                    'null': col[2],
                    'key': col[3],
                    'default': col[4],
                    'extra': col[5]
                })
            return structure
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
