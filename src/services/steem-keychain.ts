import { autoinject } from 'aurelia-framework';

@autoinject()
export class SteemKeychain {
    public useKeychain = window.steem_keychain && !localStorage.getItem('key');

    async customJson(username: string, jsonId: string, keyType: SteemKeychain.KeyType, jsonData: string, displayName: string): Promise<SteemKeychain.SteemKeyChainResponse> {
        return new Promise((resolve) => {
            steem_keychain.requestCustomJson(username, jsonId, keyType, jsonData, displayName, response => {
                resolve(response);
            });
        });
    }
}
