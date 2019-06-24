export class SliceValueConverter {
    toView(array, count) {
        if (!array) {
            return array;
        }
        
        return array.slice(0, parseInt(count));
    }
}
