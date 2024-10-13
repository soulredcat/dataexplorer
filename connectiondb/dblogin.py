import mysql.connector
from mysql.connector import Error

def create_connection():
    """Create a MySQL connection."""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='coinlist',
            user='root',
            password='karangkobar'
        )
        if connection.is_connected():
            print("Connected to MySQL database.")
        return connection
    except Error as e:
        print(f"Error: '{e}'")
        return None

