import { createConnection } from '../dblogin/dbloginlist';

export async function getTokenData(symbol: string, address: string) {
    const connection = await createConnection();
    const query = 'SELECT price0, price1, color, flip FROM tokenprice WHERE symbol = ? AND address = ?';
    
    return new Promise((resolve, reject) => {
        connection.query(query, [symbol, address], (error, results) => {
            if (error) {
                return reject(error);
            }
            if (results.length > 0) {
                resolve(results[0]);
            } else {
                resolve({ price0: null, price1: null, color: null, flip: null });
            }
        });
    });
}
