import getLocalAdd from './src/api/localadd';
import getMainnet from './src/api/mainnet';

interface Token {
    supply: string;
    id: string;
    symbol: string;
    decimals: number;
}

interface TokenPrice {
    price0: number | null;
    price1: number | null;
}

async function getTokenPrice(token: Token): Promise<TokenPrice> {
    const sources = [
        { getPrice: getLocalAdd },
        { getPrice: getMainnet },
        // Add more APIs here if needed
    ];

    for (const source of sources) {
        const result: TokenPrice = await source.getPrice(token);
        if (result.price0 !== null && result.price1 !== null) {
            return result; 
        }
    }

    console.error(`All sources failed for ${token.symbol}`);
    return { price0: null, price1: null };
}

export default getTokenPrice;
