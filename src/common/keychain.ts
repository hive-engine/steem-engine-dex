export async function customJson(username: string, jsonId: string, keyType: SteemKeychain.KeyType, jsonData: string, displayName: string): Promise<SteemKeychain.SteemKeyChainResponse> {
    return new Promise((resolve) => {
        window.steem_keychain.requestCustomJson(username, jsonId, keyType, jsonData, displayName, response => {
            resolve(response);
        });
    });
}

export async function requestTransfer(username: string, account: string, amount: string, memo: string, currency: SteemKeychain.CurrencyType): Promise<SteemKeychain.SteemKeyChainResponse> {
    return new Promise((resolve) => {
        window.steem_keychain.requestTransfer(username, account, amount, memo, currency, response => {
            resolve(response);
        });
    })
}
