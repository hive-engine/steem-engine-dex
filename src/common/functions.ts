import { Container } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { ToastMessage, ToastService } from './../services/toast-service';
import { checkTransaction } from 'common/steem-engine';
import { environment } from 'environment';
import { steemConnectJson } from 'common/steem';
import { HttpClient } from 'aurelia-fetch-client';
import trim from 'trim-character';

const http: HttpClient = new HttpClient();
const toastService: ToastService = Container.instance.get(ToastService);
const i18n: I18N = Container.instance.get(I18N);

export function queryParam(ary) {
    return Object.keys(ary).map(function (key) {
        if (Array.isArray(ary[key])) {
            const arrayParts = [];

            for (let i = 0; i < ary[key].length; i++) {
                arrayParts.push(encodeURIComponent(key + '[]') + '=' + encodeURIComponent(ary[key][i]));
            }

            return arrayParts.join('&');
        }
        return encodeURIComponent(key) + '=' + encodeURIComponent(ary[key]);
    }).join('&');
}

export function addCommas(nStr, currency?) {
    nStr += '';

    const x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    const rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    if (x2 == '' && currency == 1) {
        x2 = '.00';
    }

    return x1 + x2;
}

export function usdFormat(val, decimal_limit?, steemPrice?) {
    if (!steemPrice) {
        steemPrice = window.steem_price;
    }

    const usd = val * steemPrice;

    if (decimal_limit != null && !isNaN(parseInt(decimal_limit))) {
        return '$' + addCommas(usd.toFixed(decimal_limit));
    }

    if (usd >= 1) {
        return '$' + addCommas(usd.toFixed(2));
    } else if (usd >= 0.1) {
        return '$' + usd.toFixed(3);
    } else {
        return '$' + usd.toFixed(5);
    }
}

export function largeNumber(val) {
    val = parseFloat(val);

    if (val >= 1000000000000) {
        return addCommas(+(val / 1000000000000).toFixed(0)) + ' T';
    } else if (val >= 1000000000) {
        return addCommas(+(val / 1000000000).toFixed(3)) + ' B';
    } else if (val >= 1000000) {
        return addCommas(+(val / 1000000).toFixed(3)) + ' M';
    } else {
        return addCommas(+val.toFixed(3));
    }
}

export function popupCenter(url, title, w, h) {
    const dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft
    const top = (height - h) / 2 / systemZoom + dualScreenTop
    const newWindow = window.open(url, title, 'scrollbars=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left);

    if (newWindow?.focus) {
        newWindow.focus();
    }

    return newWindow;
}


export function tryParse(json: any) {
    try {
        return JSON.parse(json);
    } catch (err) {
        return null;
    }
}


export function formatSteemAmount(num) {
    return num ? parseFloat(num).toFixed(3).match(/^-?\d+(?:\.\d{0,3})?/)[0] : null;
}

export function percentageOf(amount: number, percentOf: number) {
    return !isNaN(amount) && !isNaN(percentOf) ? percentOf * amount / 100 : null;
}

export async function getSteemPrice() {
    try {
        const request = await http.fetch('https://postpromoter.net/api/prices', {
            method: 'GET'
        });

        const response = await request.json();

        window.steem_price = parseFloat(response.steem_price);

        return window.steem_price;
    } catch {
        window.steem_price = 0;

        return 0;
    }
}

export function toFixedNoRounding(number, n) {
    // Ref: https://helloacm.com/javascripts-tofixed-implementation-without-rounding/
    // make 3 digits without rounding e.g. 3.1499 => 3.149 and 3.1 => 3.100    
    const reg = new RegExp('^-?\\d+(?:\\.\\d{0,' + n + '})?', 'g')
    const a = number.toString().match(reg)[0];
    const dot = a.indexOf('.');
    if (dot === -1) { // integer, insert decimal dot and pad up zeros
        return a + '.' + '0'.repeat(n);
    }
    const b = n - (a.length - dot) + 1;
    return b > 0 ? (a + '0'.repeat(b)) : a;
}

export function createTransaction(username: string, contractName: string, contractAction: string, payload: any, title: string, successKey: string, errorKey: string) {
    return new Promise((resolve) => {
        const transactionData = {
            contractName: `${contractName}`,
            contractAction: `${contractAction}`,
            contractPayload: payload
        };
    
        if (window.steem_keychain) {
            window.steem_keychain.requestCustomJson(username, environment.chainId, 'Active', JSON.stringify(transactionData), title, async (response) => {
                if (response.success && response.result) {
                    try {
                        const transaction = await checkTransaction(response.result.id, 3);
    
                        const toast = new ToastMessage();
    
                        toast.message = i18n.tr(successKey, {
                            ns: 'notifications'
                        });
    
                        toastService.success(toast);
    
                        resolve(transaction);
                    } catch (e) {
                        const toast = new ToastMessage();
    
                        toast.message = i18n.tr(errorKey, {
                            ns: 'notifications'
                        });
    
                        toastService.error(toast);
    
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            });
        } else {
            steemConnectJson(username, 'active', transactionData, () => {
                resolve(true);
            });
        }
    });
}

export function sleep(wait = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, wait);
    });
}

export function trimUsername(username) {
    if (username)
        username = trim(username, '@');

    return username;
}

export function stateTokensOnlyPegged(tokens) {
    var peggedTokens = ['BCHP', 'BTCP', 'DOGEP', 'STEEMP', 'BRIDGEBTCP', 'BTSCNYP', 'BTSP', 'LTCP', 'PEOSP', 'SWIFTP', 'TLOSP', 'WEKUP'];

    var unpeggedTokens = tokens.filter(x => !peggedTokens.includes(x.symbol));

    return unpeggedTokens.length === 0;
}
