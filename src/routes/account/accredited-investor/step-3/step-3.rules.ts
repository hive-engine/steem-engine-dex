import { ValidationRules } from 'aurelia-validation';

export const Step3Rules = ValidationRules
    .ensure('entityName').required().withMessageKey('entityName')
    .when((o: any) => !Boolean(o.notAnEntity))
    .ensure('entityState').required().withMessageKey('entityState')
    .when((o: any) => !Boolean(o.notAnEntity))
    .rules;
