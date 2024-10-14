import { db, connectToDatabase, closeConnection } from './dblogin/dbloginlist'; 
import getTokenPrice from './getprice'; 

interface TokenListEntry {
    id: string;
    ca: string | null;
    supply: string | null;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
}


const fetchAndStoreTokenPrices = async (): Promise<void> => {
    connectToDatabase(); 

    const query = 'SELECT * FROM tokenlist'; 
    db.query(query, async (error, results: TokenListEntry[]) => {
        if (error) {
            console.error('Error fetching token list: ', error);
            closeConnection();
            return;
        }

        for (const token of results) {
            const { id, ca, supply, name, symbol, decimals, logoURI } = token;


            if (!supply) {
                console.log(`Skipping token: ${name} (${symbol}) due to empty supply.`);
                continue; 
            }


            const priceData = await getTokenPrice({ supply, id, symbol, decimals });


            console.log(`Token: ${name} (${symbol})`);
            console.log(`Price0: ${priceData.price0}, Price1: ${priceData.price1}`);


            const insertQuery = `
                INSERT INTO tokenprice (symbol, address, price0, price1) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE price0 = ?, price1 = ?
            `;
            const values = [symbol, id, priceData.price0, priceData.price1, priceData.price0, priceData.price1];

            db.query(insertQuery, values, (err) => {
                if (err) {
                    console.error('Error inserting/updating token price data: ', err);
                } else {
                    console.log(`Price data for ${name} (${symbol}) updated successfully.`);
                }
            });
        }


        setTimeout(() => {
            fetchAndStoreTokenPrices(); 
        }, 10000);
    });
};


fetchAndStoreTokenPrices();
