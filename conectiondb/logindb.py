import hashlib
from db_connection import create_connection

def login_user(username, password):
    """Login user by checking credentials."""
    try:
        connection = create_connection()
        if connection is None:
            return False

        cursor = connection.cursor()
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        query = "SELECT * FROM users WHERE username = %s AND password = %s"
        cursor.execute(query, (username, hashed_password))
        user = cursor.fetchone()

        if user:
            print("Login successful!")
            return True
        else:
            print("Invalid username or password!")
            return False
    except Error as e:
        print(f"Error: '{e}'")
        return False
    finally:
        if connection and connection.is_connected():
            connection.close()

if __name__ == "__main__":
    username = input("Enter username: ")
    password = input("Enter password: ")
    login_user(username, password)
