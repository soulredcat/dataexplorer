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

            try {
                const priceData = await getTokenPrice({ supply, id, symbol, decimals });

                console.log(`Token: ${name} (${symbol})`);
                console.log(`Price0: ${priceData.price0}, Price1: ${priceData.price1}`);

                let price0: number = priceData.price0 ?? 0; 
                let price1: number = priceData.price1 ?? 0; 

                const insertQuery = `
                    INSERT INTO tokenprice (symbol, address, price0, price1) 
                    VALUES (?, ?, ?, ?) 
                    ON DUPLICATE KEY UPDATE price0 = ?, price1 = ?
                `;
                const values = [symbol, id, price0, price1, price0, price1];

                await new Promise<void>((resolve, reject) => {
                    db.query(insertQuery, values, (err) => {
                        if (err) {
                            console.error('Error inserting/updating token price data: ', err);
                            reject(err);
                        } else {
                            console.log(`Price data for ${name} (${symbol}) updated successfully.`);
                            resolve();
                        }
                    });
                });

                const currentPriceQuery = `
                    SELECT price0, color FROM tokenprice WHERE symbol = ? AND address = ?;
                `;

                const currentPriceResult: Array<{ price0: number | null; color: string | null }> = await new Promise((resolve, reject) => {
                    db.query(currentPriceQuery, [symbol, id], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });

                const previousPrice0 = currentPriceResult.length > 0 ? currentPriceResult[0].price0 : null;
                const previousColor = currentPriceResult.length > 0 ? currentPriceResult[0].color : null;

                let newColor: string | null = previousColor; 

                if (previousPrice0 !== null) {
                    newColor = price0 > previousPrice0 ? 'green' : (price0 < previousPrice0 ? 'red' : previousColor);
                }

                const updatePriceQuery = `
                    INSERT INTO tokenprice (symbol, address, price0, price1, color) 
                    VALUES (?, ?, ?, ?, COALESCE(?, color)) 
                    ON DUPLICATE KEY UPDATE 
                        price0 = ?, 
                        price1 = ?, 
                        color = COALESCE(?, color);
                `;

                await db.query(updatePriceQuery, [symbol, id, price0, price1, newColor, price0, price1, newColor]);
                console.log(`Updated price for ${symbol} in tokenprice database with color ${newColor}.`);

            } catch (err) {
                console.error(`Error processing token ${name} (${symbol}):`, err);
            }
        }

        setTimeout(fetchAndStoreTokenPrices, 10000); 
    });
};

fetchAndStoreTokenPrices();
