export class ToFixedValueConverter {
    toView(value, precision) {
        const parsed = parseFloat(value);

        return !isNaN(parsed) ? parsed.toFixed(precision) : value;
    }
}
