import { Redirect } from 'aurelia-router';
import { observable } from 'aurelia-binding';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class OpenOrders {
    private loadingOpenOrders = false;
    private orders = [];
    
    constructor(private se: SteemEngine) {

    }

    async canActivate() {
        this.loadingOpenOrders = true;

        try {            
            this.orders = await this.se.getUserOpenOrders();
        } catch {
            return false;
        } finally {
            this.loadingOpenOrders = false;
        }
    }
}
