import { ISettings } from './../store/state';
import { environment } from 'environment';
import { login, setAccount, logout } from 'store/actions';
import { dispatchify } from 'aurelia-store';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDDPjgEMwAD1PU3PG5Dinci2QjRmQ5Pi4k",
    authDomain: "steem-engine-dex.firebaseapp.com",
    databaseURL: "https://steem-engine-dex.firebaseio.com",
    projectId: "steem-engine-dex",
    storageBucket: "steem-engine-dex.appspot.com",
    messagingSenderId: "947796838950",
    appId: "1:947796838950:web:af5b8ba241cc4910"
};

firebase.initializeApp(firebaseConfig);

export async function authStateChanged() {
    return new Promise(resolve => {
        firebase.auth().onAuthStateChanged(async user => {
            // eslint-disable-next-line no-undef
            const token = await firebase.auth()?.currentUser?.getIdTokenResult(true);

            if (user) {
                dispatchify(login)(user.uid);
                if (token) {
                    dispatchify(setAccount)({token});
                }
                resolve();
            } else {
                dispatchify(logout)();
                resolve();
            }
        });
    });
}

export async function getFirebaseUser(username: string) {
    const doc = await firebase
        .firestore()
        .collection('users')
        .doc(username)
        .get();

    return doc.exists ? doc.data() : null;
}

export async function loadSiteSettings() {
    const settings = await firebase
        .firestore()
        .collection('admin')
        .doc('settings')
        .get();

    return settings.exists ? { ...environment, ...settings.data() } : { ...environment } as ISettings;
}
