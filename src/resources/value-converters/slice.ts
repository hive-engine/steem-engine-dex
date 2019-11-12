export class SliceValueConverter {
    toView(array, count, reverse = false) {
        if (!array) {
            return array;
        }

        return reverse ? array.slice(0, parseInt(count)).reverse() : array.slice(0, parseInt(count));
    }
}
