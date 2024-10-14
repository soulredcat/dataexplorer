import getTokenPrice from './getprice';

interface Token {
    supply: string;
    id: string;
    symbol: string;
    decimals: number;
}

// Mock token data
const mockToken: Token = {
    supply: '25ywM8iGxKpZWuGA5z6DXKGcZCXtPBmnbQyJEsjvjjWTy',  // Replace with actual supply address
    id: '1a281053ba8601a658368594da034c2e99a0fb951b86498d05e76aedfe666800',             // Replace with actual token ID
    symbol: 'AYIN',                       // Replace with actual token symbol
    decimals: 18,                          // Replace with actual decimals
};

async function testGetTokenPrice() {
    try {
        const result = await getTokenPrice(mockToken);
        console.log(`Price for ${mockToken.symbol}:`);
        console.log(`price0: ${result.price0 !== null ? result.price0 : 'Not available'}`);
        console.log(`price1: ${result.price1 !== null ? result.price1 : 'Not available'}`);
    } catch (error) {
        console.error('Error fetching token price:', error);
    }
}

// Run the test
testGetTokenPrice();
