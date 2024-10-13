from db_connection import create_connection

def create_table():
    """Create the 'tokens' table in the database."""
    try:
        connection = create_connection()
        if connection is None:
            return
        
        cursor = connection.cursor()
        
        
        create_table_query = """
        CREATE TABLE IF NOT EXISTS tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ca VARCHAR(255) NOT NULL,
            supply DECIMAL(30, 18) NOT NULL,
            name VARCHAR(255) NOT NULL,
            symbol VARCHAR(50) NOT NULL,
            decimals INT NOT NULL,
            logoURI VARCHAR(255) NOT NULL
        );
        """
        
        cursor.execute(create_table_query)
        connection.commit()
        print("Table 'tokens' created successfully.")
        
    except Error as e:
        print(f"Error: '{e}'")
    finally:
        if connection and connection.is_connected():
            connection.close()

if __name__ == "__main__":
    
    username = input("Enter username to log in: ")
    password = input("Enter password: ")
    
    if login_user(username, password):
        create_table()
