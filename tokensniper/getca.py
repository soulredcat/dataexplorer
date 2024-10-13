import sys
import os
import requests
import logging
import mysql.connector

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from connectiondb.dblogin import create_connection

api_url = "https://indexer.alph.pro/api/tokens"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def update_address_to_db(connection, token_data):
    try:
        cursor = connection.cursor()

        query = """
        UPDATE tokenlist
        SET ca = %s
        WHERE id = %s
        """
        
        data_to_update = (
            token_data['address'],
            token_data['id']
        )
        
        cursor.execute(query, data_to_update)

        connection.commit()
        logging.info(f"Address {token_data['address']} for ID {token_data['id']} successfully updated in the database.")
    
    except mysql.connector.Error as err:
        logging.error(f"Error updating database: {err}")
    finally:
        cursor.close()

def fetch_and_update_token_address():
    try:
        response = requests.get(api_url, timeout=10)

        if response.status_code == 200:
            data = response.json()

            connection = create_connection()

            if connection is not None:
                for token in data['tokens']:
                    update_address_to_db(connection, token)

                connection.close()
                logging.info("Update process completed.")
            else:
                logging.error("Failed to connect to the database.")

        else:
            logging.error(f"Failed to fetch data from the API. Status code: {response.status_code}")

    except requests.exceptions.Timeout:
        logging.error("API request timed out.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching data from the API: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")

if __name__ == "__main__":
    fetch_and_update_token_address()
