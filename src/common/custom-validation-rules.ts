import { NftService } from './../services/nft-service';
import { Container } from 'aurelia-framework';
import { ValidationRules } from 'aurelia-validation';

const nftService = Container.instance.get(NftService);

async function nftExists(symbol: string) {
    const nft = await nftService.loadNft(symbol);

    return nft !== null ? false : true;
}

ValidationRules.customRule('nftAvailable', async (value, obj) => {
    return await nftExists(value);
}, 'Token already exists');
