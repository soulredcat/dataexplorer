import fetch from 'node-fetch';

interface Token {
    supply: string;
    id: string;
    symbol: string;
    decimals: number;
}

function convertAmountWithDecimals(amount: number, decimals: number): number {
    return amount / Math.pow(10, decimals);
}

async function getMainnet(token: Token): Promise<{ price0: number | null; price1: number | null }> {

    if (!token.supply || !token.id || !token.symbol || token.decimals === undefined) {
        throw new Error("Token object is missing required properties.");
    }

    try {
        const response1 = await fetch(`https://backend.mainnet.alephium.org/addresses/${token.supply}/tokens/${token.id}/balance`);
        const tokenData = await response1.json();
        const response2 = await fetch(`https://backend.mainnet.alephium.org/addresses/${token.supply}/balance`);
        const mainTokenData = await response2.json();

        const tokenBalance = parseFloat(tokenData.balance);
        const mainTokenBalance = parseFloat(mainTokenData.balance);


        if (isNaN(tokenBalance) || isNaN(mainTokenBalance) || mainTokenBalance === 0) {
            console.error(`Invalid balance data for ${token.symbol}`);
            return { price0: null, price1: null };
        }

        const normalizedTokenBalance = convertAmountWithDecimals(tokenBalance, token.decimals);
        const normalizedMainBalance = convertAmountWithDecimals(mainTokenBalance, 18);

        const price0 = normalizedMainBalance / normalizedTokenBalance;
        const price1 = normalizedTokenBalance / normalizedMainBalance;

        return { price0, price1 };
    } catch (error) {
        console.error(`Failed to fetch price for ${token.symbol}:`, error);
        throw error; 
    }
}

export default getMainnet;
