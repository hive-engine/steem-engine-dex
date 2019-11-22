import { customElement, bindable, bindingMode } from 'aurelia-framework';

@customElement('buybook')
export class BuyBook {
    @bindable data;
    @bindable loading = true;
    @bindable pageNo = 1;
    @bindable buyBook;
    @bindable buyData;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) price;

    setBidPrice(newValue) {
        this.price = newValue;
    }

    dataChanged(newData) {
        //truncate buy book by 10
        // delay a bit so data can be available
        setTimeout(() => {
            this.buyData = this.buyBook.slice((this.pageNo - 1) * 10, this.pageNo * 10);
            document.getElementById('loadMoreBuy').style.display = 'block';
        }, 500);
        this.loading = false;
    }

    seeMoreBuy() {
        //increase page no
        this.pageNo += 1;

        //add multiple entries
        let newData = this.buyBook.slice((this.pageNo - 1) * 10, this.pageNo * 10);

        newData.map(data => {
            this.buyData.push(data);
        });
    }
}
