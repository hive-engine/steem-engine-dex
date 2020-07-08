import { Container } from 'aurelia-framework';
import { environment } from 'environment';
import { AuthType } from './types';
import steem from 'steem';
import { popupCenter } from './functions';
import { ToastService, ToastMessage } from 'services/toast-service';

const toastService: ToastService = Container.instance.get(ToastService);

export async function getAccount(username: string) {
    try {
        const user = await steem.api.getAccountsAsync([username]);
    
        return user && user.length > 0 ? user[0] : null;
    } catch (e) {
        throw new Error(e);
    }
}

export async function steemConnectJson(username: string, auth_type: AuthType, data: any, callback?) {  
    const toast = new ToastMessage();
    toast.message = "SteemConnect is deprecated. Please use Keychain."
    toastService.error(toast);
    return false;

    let url = 'https://steemconnect.com/sign/custom-json?';

    if (auth_type == 'active') {
        url += 'required_posting_auths=' + encodeURI('[]');
        url += '&required_auths=' + encodeURI('["' + username + '"]');
        url += `&authority=active`;
    } else {
        url += 'required_posting_auths=' + encodeURI('["' + username + '"]');
    }

    url += '&id=' + environment.chainId;
    url += '&json=' + encodeURI(JSON.stringify(data));

    popupCenter(url, 'steemconnect', 500, 560);

    if (callback) {
        window._sc_callback = callback;
    }
}

export async function steemConnectJsonId(username: string, auth_type: AuthType, id: string, data: any, callback) {
    const toast = new ToastMessage();
    toast.message = "SteemConnect is deprecated. Please use Keychain."
    toastService.error(toast);
    return false;

    let url = 'https://steemconnect.com/sign/custom-json?';

    if (auth_type == 'active') {
        url += 'required_posting_auths=' + encodeURI('[]');
        url += '&required_auths=' + encodeURI('["' + username + '"]');
        url += `&authority=active`;
    } else {
        url += 'required_posting_auths=' + encodeURI('["' + username + '"]');
    }

    url += '&id=' + id;
    url += '&json=' + encodeURI(JSON.stringify(data));

    popupCenter(url, 'steemconnect', 500, 560);

    this._sc_callback = callback;
}

export async function steemConnectTransfer(from: string, to: string, amount: string, memo: string, callback: any) {
    const toast = new ToastMessage();
    toast.message = "SteemConnect is deprecated. Please use Keychain."
    toastService.error(toast);
    return false;

    let url = 'https://steemconnect.com/sign/transfer?';
    url += '&from=' + encodeURI(from);
    url += '&to=' + encodeURI(to);
    url += '&amount=' + encodeURI(amount);
    url += '&memo=' + encodeURI(memo);

    popupCenter(url, 'steemconnect', 500, 560);
    window._sc_callback = callback;
}
