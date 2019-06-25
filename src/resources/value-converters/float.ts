export class FloatValueConverter {
    toView(value) {
        const parse = parseFloat(value);

        return !isNaN(parse) ? parse : 0;
    }
}
