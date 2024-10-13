import sys
import os
import requests
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from conectiondb.dbconection import create_connection 
logging.basicConfig(level=logging.INFO)

def save_tokens_to_db(tokens):
    """Save token data to the database."""
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            insert_query = """
            INSERT INTO tokens (id, name, symbol, decimals, logoURI)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE name = VALUES(name), symbol = VALUES(symbol), 
                                    decimals = VALUES(decimals), logoURI = VALUES(logoURI);
            """
            
            token_data = [(token.get("id"), token.get("name"), token.get("symbol"),
                           token.get("decimals"), token.get("logoURI")) for token in tokens]
            
            cursor.executemany(insert_query, token_data)
            
            connection.commit()
            logging.info(f"Inserted {cursor.rowcount} tokens into the database.")
        except Exception as e:
            logging.error(f"Failed to insert tokens into the database: {e}")
        finally:
            cursor.close()
            connection.close()
    else:
        logging.error("Connection to database failed.")


def fetch_data_from_api(url):
    """Fetch JSON data from the provided API URL."""
    try:
        response = requests.get(url)
        response.raise_for_status()  
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch data from API: {e}")
        return None

if __name__ == "__main__":
    api_url = "https://raw.githubusercontent.com/alephium/token-list/master/tokens/mainnet.json"
    

    json_data = fetch_data_from_api(api_url)
    if json_data and 'tokens' in json_data:
        save_tokens_to_db(json_data['tokens'])
    else:
        logging.error("No valid 'tokens' data found in the API response.")
