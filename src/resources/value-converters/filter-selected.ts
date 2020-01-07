export class FilterSelectedValueConverter {
    toView(arr, properties, returnBool = false) {
        if (!arr) {
            return arr;
        }

        const filtered = arr.filter(val => !properties.some(prop => prop.name === val));

        if (returnBool) {
            return filtered.length;
        }

        return filtered;
    }
}
