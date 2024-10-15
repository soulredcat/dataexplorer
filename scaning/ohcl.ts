import { connectToDatabase, closeConnection } from './dblogin/ohcllogin';
import { db } from './dblogin/dbloginlist';

const fetchOHLCData = async (): Promise<void> => {
    const symbols = await getSymbols();
    for (const symbol of symbols) {
        const priceData = await getPriceData(symbol);
        const ohlc = calculateOHLC(priceData);
        await saveOHLCData(symbol, ohlc);
    }
    setTimeout(fetchOHLCData, 60000);
};

const getSymbols = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        db.query('SELECT symbol FROM tokenprice', (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.map((row) => row.symbol));
            }
        });
    });
};

const getPriceData = async (symbol: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const query = `SELECT price0, timestamp FROM tokenprice WHERE symbol = ? ORDER BY timestamp DESC LIMIT 60`;
        db.query(query, [symbol], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

const calculateOHLC = (data: any[]): { open: number; high: number; low: number; close: number; volume: number } => {
    const open = data[0].price0;
    const close = data[data.length - 1].price0;
    const high = Math.max(...data.map((item) => item.price0));
    const low = Math.min(...data.map((item) => item.price0));
    const volume = data.reduce((total, item) => total + item.price0, 0);
    return { open, high, low, close, volume };
};

const saveOHLCData = async (symbol: string, ohlc: { open: number; high: number; low: number; close: number; volume: number }): Promise<void> => {
    const query = `
        INSERT INTO ${symbol} (timestamp, open, high, low, close, volume)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const timestamp = Math.floor(Date.now() / 1000);
    await new Promise((resolve, reject) => {
        db.query(query, [timestamp, ohlc.open, ohlc.high, ohlc.low, ohlc.close, ohlc.volume], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

connectToDatabase();
fetchOHLCData();
