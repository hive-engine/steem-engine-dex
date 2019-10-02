import { valueConverter } from 'aurelia-binding';

const capitalise = (s) => {
    if (typeof s !== 'string') {
        return '';
    }

    return s.charAt(0).toUpperCase() + s.slice(1);
}

@valueConverter('capitalise')
export class Capitalise {
    toView(value) {
        if (!value) {
            return value;
        }

        return capitalise(value);
    }
}
