import sys
import os
import requests
import logging
import mysql.connector

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from connectiondb.dblogin import create_connection

api_url_template = "https://api.zobula.xyz/api/1/market/pairs?asset={ca}&blockchain=Alephium&account=null&signature=null"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def update_supply_in_db(connection, token_id, supply_value):
    try:
        cursor = connection.cursor()

        query = """
        UPDATE tokenlist
        SET supply = %s
        WHERE id = %s
        """

        data_to_update = (
            supply_value,
            token_id
        )

        cursor.execute(query, data_to_update)

        connection.commit()
        logging.info(f"Supply for token ID {token_id} successfully updated to {supply_value}.")
    
    except mysql.connector.Error as err:
        logging.error(f"Error updating database: {err}")
    finally:
        cursor.close()

def fetch_token_data_and_update_supply(connection, ca, token_id):
    try:
        api_url = api_url_template.format(ca=ca)
        response = requests.get(api_url, timeout=10)

        if response.status_code == 200:
            data = response.json()

            
            first_pair = data['data']['pairs'][0]  
            supply = first_pair['address']

            update_supply_in_db(connection, token_id, supply)

        else:
            logging.error(f"Failed to fetch data from API for {ca}. Status code: {response.status_code}")

    except requests.exceptions.Timeout:
        logging.error(f"API request timed out for {ca}.")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching data from the API for {ca}: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")

def update_supply_for_all_tokens():
    try:
        connection = create_connection()

        if connection is not None:
            cursor = connection.cursor()
            cursor.execute("SELECT id, ca FROM tokenlist WHERE ca IS NOT NULL")

            tokens = cursor.fetchall()

            for token in tokens:
                token_id, ca = token
                fetch_token_data_and_update_supply(connection, ca, token_id)

            connection.close()
            logging.info("Supply update process completed.")
        else:
            logging.error("Failed to connect to the database.")

    except mysql.connector.Error as err:
        logging.error(f"Database error: {err}")

if __name__ == "__main__":
    update_supply_for_all_tokens()
