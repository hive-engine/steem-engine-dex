import { query } from 'common/apollo';
import { ValidationRules } from 'aurelia-validation';

async function nftExists(symbol: string) {
    const response = await query(`nft(symbol: "${symbol}") { symbol }`);

    return response.data.nft !== null;
}

ValidationRules.customRule('nft-token', async (value, obj) => {
    return await nftExists(value);
}, 'Token already exists');
