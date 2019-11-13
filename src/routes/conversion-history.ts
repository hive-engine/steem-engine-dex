import { loadTokensList, loadConversionHistory } from 'store/actions';
import { Store, dispatchify } from 'aurelia-store';
import { autoinject } from 'aurelia-framework';
import { State } from 'store/state';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app';
import { SteemEngine } from 'services/steem-engine';
import moment from 'moment';

@autoinject()
export class ConversionHistory {
    private state: State;
    private username: string;
    private subscription: Subscription;
    private conversions: IConversionItemResult[] = [];

    private conversionsTable: HTMLTableElement;

    constructor(private se: SteemEngine, private store: Store<State>) {
        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;
            }
        });
    }

    unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    loadTable() {
        // @ts-ignore
        $(this.conversionsTable).DataTable({
            bInfo: false,
            paging: false,
            searching: false,
            ordering: false
        });
    }

    attached() {
        this.loadTable();    
    }

    async activate() {
        this.username = "aggroed";
        await dispatchify(loadConversionHistory)(this.username);

        this.conversions = this.state.conversionHistory;

        this.conversions.forEach(x => {
            const dt = new Date(x.created_at);
            x.created_at_string = moment(dt).format('YYYY-M-DD HH:mm:ss');
        })
    }
}
