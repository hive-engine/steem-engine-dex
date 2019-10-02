export class LastValueConverter {
    toView(array) {
        if (!array || !array.length) {
            return array;
        }
        
        return [array[array.length - 1]];
    }
}
