import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';

import firebase from 'firebase/app';

@autoinject()
export class Tokens {
    private tokenTable: HTMLTableElement;
    private user;
    private tokens = [];

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {

    }

    async canActivate() {
        this.tokens = await this.se.loadTokens() as any;
    }

    async activate() {
        try {
            const doc = await firebase.firestore().collection('users').doc(this.se.getUser()).get();

            if (doc.exists) {
                this.user = doc.data();

                if (this.user.favourites) {
                    this.tokens.map(token => {
                        if (this.user.favourites.includes(token.symbol)) {
                            token.isFavourite = true;
                        } else {
                            token.isFavourite = false;
                        }

                        return token;
                    });
                }
            }
        } catch {
            return true;
        }
    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable({
            bInfo: false,
            paging: false,
            searching: false
        });
    }

    favouriteToken(token) {
        this.taskQueue.queueTask(() => {
            token.isFavourite = !token.isFavourite;

            this.tokens.forEach(t => {
                if (t.isFavourite && !this.user.favourites.includes(t.symbol)) {
                    this.user.favourites.push(t.symbol);
                } else if (!t.isFavourite && this.user.favourites.includes(t.symbol)) {
                    this.user.favourites.splice(this.user.favourites.indexOf(t.symbol), 1);
                }
            });

            const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

            userRef.set(this.user, {
                merge: true
            });
        });
    }
}
