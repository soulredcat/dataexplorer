import { createConnection } from '../dblogin/dbloginlist';

export async function getEndPrices(symbol: string) {
    const connection = await createConnection();
    const query = 'SELECT price0, price1 FROM tokenprice WHERE symbol = ?';
    
    return new Promise((resolve, reject) => {
        connection.query(query, [symbol], (error, results) => {
            if (error) {
                return reject(error);
            }
            if (results.length > 0) {
                resolve(results[0]);
            } else {
                resolve({ price0: null, price1: null });
            }
        });
    });
}
