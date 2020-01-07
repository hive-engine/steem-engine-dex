export class FilterSelectedValueConverter {
    toView(arr, properties) {
        if (!arr) {
            return arr;
        }

        return arr.filter(val => properties.some(prop => prop.name === val));
    }
}
