export class SliceValueConverter {
    toView(array, count, reverse = false) {
        if (!array) {
            return array;
        }

        if (reverse)
            return array.slice(0, parseInt(count)).reverse();
        else         
            return array.slice(0, parseInt(count));
    }
}
