from connectiondb.dblogin import create_connection
from mysql.connector import Error

def create_database(cursor):
    """Create the 'coinlist' database if it doesn't exist."""
    cursor.execute("CREATE DATABASE IF NOT EXISTS coinlist;")
    print("Database 'coinlist' created or already exists.")

def create_table():
    """Create the 'tokenlist' table in the 'coinlist' database if it doesn't exist."""
    connection = None
    try:
        connection = create_connection()
        if connection is None:
            print("No connection to the database.")
            return
        
        cursor = connection.cursor()


        create_database(cursor)


        cursor.execute("USE coinlist;")


        create_table_query = """
        CREATE TABLE IF NOT EXISTS tokenlist (
            id VARCHAR(255) NOT NULL PRIMARY KEY, 
            ca VARCHAR(255),                     
            supply VARCHAR(255),              
            name VARCHAR(255) NOT NULL,
            symbol VARCHAR(50) NOT NULL,
            decimals INT NOT NULL,
            logoURI VARCHAR(255) NOT NULL
        );
        """
        
        cursor.execute(create_table_query)
        connection.commit()
        print("Table 'tokenlist' created successfully or already exists.")
        
    except Error as e:
        print(f"Error: '{e}'")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_table()
