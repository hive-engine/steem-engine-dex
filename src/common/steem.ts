import { environment } from './../../aurelia_project/environments/prod';
import { AuthType } from './types';
import steem from 'steem';
import { popupCenter } from './functions';

export async function getAccount(username: string) {
    try {
        const user = await steem.api.getAccountsAsync([username]);
    
        return user && user.length > 0 ? user[0] : null;
    } catch (e) {
        throw new Error(e);
    }
}

export async function steemConnectJson(username: string, auth_type: AuthType, data: any, callback?) {
    let url = 'https://steemconnect.com/sign/custom-json?';

    if (auth_type == 'active') {
        url += 'required_posting_auths=' + encodeURI('[]');
        url += '&required_auths=' + encodeURI('["' + username + '"]');
    } else {
        url += 'required_posting_auths=' + encodeURI('["' + username + '"]');
    }

    url += '&id=' + environment.CHAIN_ID;
    url += '&json=' + encodeURI(JSON.stringify(data));

    popupCenter(url, 'steemconnect', 500, 560);

    if (callback) {
        window._sc_callback = callback;
    }
}

export async function steemConnectJsonId(username: string, auth_type: AuthType, id: string, data: any, callback) {
    let url = 'https://steemconnect.com/sign/custom-json?';

    if (auth_type == 'active') {
        url += 'required_posting_auths=' + encodeURI('[]');
        url += '&required_auths=' + encodeURI('["' + username + '"]');
    } else {
        url += 'required_posting_auths=' + encodeURI('["' + username + '"]');
    }

    url += '&id=' + id;
    url += '&json=' + encodeURI(JSON.stringify(data));

    popupCenter(url, 'steemconnect', 500, 560);

    this._sc_callback = callback;
}

export async function steemConnectTransfer(from: string, to: string, amount: string, memo: string, callback: any) {
    let url = 'https://steemconnect.com/sign/transfer?';
    url += '&from=' + encodeURI(from);
    url += '&to=' + encodeURI(to);
    url += '&amount=' + encodeURI(amount);
    url += '&memo=' + encodeURI(memo);

    popupCenter(url, 'steemconnect', 500, 560);
    window._sc_callback = callback;
}
