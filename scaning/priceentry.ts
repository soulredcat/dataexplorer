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

                const insertQuery = `
                    INSERT INTO tokenprice (symbol, address, price0, price1) 
                    VALUES (?, ?, ?, ?) 
                    ON DUPLICATE KEY UPDATE price0 = ?, price1 = ?
                `;
                const values = [symbol, id, priceData.price0, priceData.price1, priceData.price0, priceData.price1];

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

                
                await saveLatestPriceToCoinlist({ coins: symbol, supply: id }, priceData.price0);

            } catch (err) {
                console.error(`Error processing token ${name} (${symbol}):`, err);
            }
        }


        setTimeout(() => {
            fetchAndStoreTokenPrices(); 
        }, 10000);
    });
};

async function saveLatestPriceToCoinlist(token, price) {
    await createTokensTableIfNotExists();

    const currentPriceQuery = `
        SELECT price, color FROM tokens WHERE symbol = ? AND source = 0;
    `;
    
    try {
        const [currentPriceResult] = await db.query(currentPriceQuery, [token.coins]);
        const previousPrice = currentPriceResult.length > 0 ? currentPriceResult[0].price : null;
        const previousColor = currentPriceResult.length > 0 ? currentPriceResult[0].color : null;

        let newColor: string | null = null;

        if (previousPrice !== null) {
           
            newColor = price > previousPrice ? 'green' : (price < previousPrice ? 'red' : previousColor);
        }

        const updatePriceQuery = `
            INSERT INTO tokens (symbol, price, address, color, source) 
            VALUES (?, ?, ?, COALESCE(?, color), 0) 
            ON DUPLICATE KEY UPDATE 
                price = ?, 
                color = COALESCE(?, color);
        `;

        await db.query(updatePriceQuery, [token.coins, price, token.supply, newColor, price, newColor]);
        console.log(`Updated price for ${token.coins} in coinlist database with color ${newColor}.`);
    } catch (err) {
        console.error(`Error updating price for ${token.coins} in coinlist:`, err);
    }
}

fetchAndStoreTokenPrices();
