declare namespace SSC {
    interface SSC {
        new(rpcUrl: string): SSC;
    }
}

declare const SSC: SSC.SSC;

interface Window {
    steem_keychain: SSC.SSC;
}
