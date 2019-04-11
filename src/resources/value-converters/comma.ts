import { addCommas } from 'common/functions';

export class CommaValueConverter {
    toView(value, currency?) {
        if (!value) {
            return value;
        }

        return addCommas(value, currency);
    }
}
