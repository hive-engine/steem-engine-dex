import { customElement, autoinject, bindable } from 'aurelia-framework';
import { DswapOrderModal } from '../modals/dswap-order';
import { DialogService } from 'aurelia-dialog';

import styles from "../dswap.module.css";

@autoinject()
@customElement('receiveAddress')
export class ReceiveAddress {
    private styles = styles;

    constructor(private dialogService: DialogService) {}

    getReceiveAddress() {
        console.log('This will be your Receive Address');
    }
}
