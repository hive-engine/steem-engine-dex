import { valueConverter } from 'aurelia-binding';

@valueConverter('keys')
export class Keys {
    toView(obj) {
        return Reflect.ownKeys(obj).filter(key => key !== '__observers__');
    }
}
