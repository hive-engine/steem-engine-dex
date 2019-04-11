import { usdFormat } from 'common/functions';

export class UsdFormatValueConverter {
    toView(value, decimalLimit) {
        if (!value) {
            return value;
        }

        return usdFormat(value, decimalLimit);
    }
}
