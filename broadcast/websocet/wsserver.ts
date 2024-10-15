import WebSocket from 'ws';
import { getTokenData } from './queryws'; 

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', async (message: string) => {
        const { symbol, address } = JSON.parse(message);

        try {
            const data = await getTokenData(symbol.toUpperCase(), address);

            ws.send(JSON.stringify({
                symbol: symbol.toUpperCase(),
                address: address,
                price0: data.price0,
                price1: data.price1,
                color: data.color,
                flip: data.flip,
                last_updated: new Date() 
            }));
        } catch (error) {
            ws.send(JSON.stringify({ error: 'Failed to fetch token data' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on ws://localhost:8080');
