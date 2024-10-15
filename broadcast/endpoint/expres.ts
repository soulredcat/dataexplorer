import express from 'express';
import { getEndPrices } from './quaryep';

const app = express();
const port = 9595;

app.get('/price/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const prices = await getEndPrices(symbol);
        res.json({
            symbol: symbol,
            price0: prices.price0,
            price1: prices.price1,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
