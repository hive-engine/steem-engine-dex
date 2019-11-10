import { addCommas } from 'common/functions';

export class CommaValueConverter {
    toView(value: string, currency?: string) {
        if (!value) {
            return value;
        }

        return addCommas(value, currency);
    }
}
