import { Step1Model } from './step-1.model';
import { ValidationRules } from 'aurelia-validation';

export const Step1Rules = ValidationRules
    .ensure('firstName').required().withMessageKey('firstName')
    .ensure('lastName').required().withMessageKey('lastName')
    .ensure('homeAddress').required().withMessageKey('homeAddress')
    .ensure('emailAddress').required().email().withMessageKey('emailAddress')
    .ensure('title').required().withMessageKey('title')
    .ensure('employedSince').required().withMessageKey('employedSince')
    .ensure('dateOfBirth').required().withMessageKey('dateOfBirth')
    .ensure('stateRegisteredToVote').required().withMessageKey('stateRegisteredToVote')
        .when((o: Step1Model) => o.country === 'US')
    .ensure('cellPhone').required().withMessageKey('cellPhone')
    .ensure('businessProfession').required().withMessageKey('businessProfession')
    .ensure('companyName').required().withMessageKey('companyName')
    .ensure('businessAddress').required().withMessageKey('businessAddress')
    .rules;
