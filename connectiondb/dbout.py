from connectiondb.dblogin import create_connection
from mysql.connector import Error

def fetch_data(query):
    """Fetch data from the database."""
    connection = create_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
            return rows
        except Error as e:
            print(f"Error: '{e}'")
            return None
        finally:
            cursor.close()
            connection.close()
    return None

if __name__ == "__main__":
    query = "SELECT * FROM your_table_name;"
    data = fetch_data(query)
    if data:
        print(data)
