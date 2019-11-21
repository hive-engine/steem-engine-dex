import { ValidationRules } from 'aurelia-validation';

export const Step2Rules = ValidationRules
    .ensure('contactMethod').required().withMessageKey('contactMethod')
    .ensure('contactMethodAlternative').required().withMessageKey('contactMethodAlternative')
    .when((o: any) => o.contactMethod === 'other')
    .rules;
