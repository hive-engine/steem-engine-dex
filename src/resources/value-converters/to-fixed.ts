export class ToFixedValueConverter {
    toView(value, precision) {
        const parsed = parseFloat(value);

        return typeof parsed === 'number' ? parsed.toFixed(precision) : value;
    }
}
