import { customElement, bindable, bindingMode } from 'aurelia-framework';

@customElement('sellbook')
export class SellBook {
    @bindable data;
    @bindable loading = true;
    @bindable pageNo = 1;
    @bindable sellBook;
    @bindable sellData;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) price;

    setBidPrice(newValue) {
        this.price = newValue;
    }
    
    dataChanged() {
        //truncate sell book by 10
        // delay a bit so data can be available
        setTimeout(() => {

            this.sellData = this.sellBook.slice((this.pageNo - 1) * 10, this.pageNo * 10);
            document.getElementById('loadMoreSell').style.display = 'block'
        }, 500)
        this.loading = false;
    }

    seeMoreSell() {

        //increase page no
        this.pageNo  += 1;

        //add multiple entries
        let newData = this.sellBook.slice((this.pageNo - 1) * 10, this.pageNo * 10);

        newData.map((data) => {

            this.sellData.push(data)
        })
    }
}
