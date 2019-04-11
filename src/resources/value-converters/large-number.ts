import { largeNumber } from 'common/functions';

export class LargeNumberValueConverter {
    toView(value) {
        if (!value) {
            return value;
        }
        
        return largeNumber(value);
    }
}
