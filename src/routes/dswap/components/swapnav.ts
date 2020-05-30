import { customElement, autoinject, bindable } from 'aurelia-framework';
import { DswapOrderModal } from '../modals/dswap-order';
import { DialogService } from 'aurelia-dialog';

import styles from "../dswap.module.css";

@autoinject()
@customElement('swapnav')
export class SwapNav {
    constructor(private dialogService: DialogService) {}
    private styles = styles;


    initiateMarketMaker() {
        this.dialogService.open({ viewModel: DswapOrderModal }).whenClosed(response => {
            console.log(response);
        });
    }
}
