import { customElement, autoinject, bindable } from 'aurelia-framework';
import { DswapOrderModal } from '../modals/dswap-order';
import { DialogService } from 'aurelia-dialog';


import styles from "../dswap.module.css";

@autoinject()
@customElement('dashboard')
export class Dashboard {
    constructor(private dialogService: DialogService) {}
    private styles = styles;

    withdraw() {
        this.dialogService.open({ viewModel: DswapOrderModal }).whenClosed(response => {
            console.log(response);
        });
    }
}
