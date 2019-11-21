import { Step4Model } from './step-4/step-4.model';
import { Step3Model } from './step-3/step-3.model';
import { Step2Model } from './step-2/step-2.model';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { Store } from 'aurelia-store';
import { autoinject, newInstance, computedFrom, BindingEngine, Disposable } from 'aurelia-framework';
import { ValidationController } from 'aurelia-validation';
import { Subscription } from 'rxjs';
import { State } from 'store/state';

import { Step1Rules } from './step-1/step-1.rules';
import { Step1Model } from './step-1/step-1.model';
import { Step2Rules } from './step-2/step-2.rules';
import { Step3Rules } from './step-3/step-3.rules';
import { Step4Rules } from './step-4/step-4.rules';
import { I18N } from 'aurelia-i18n';


@autoinject()
export class InvestorQuestionnaire {
    private state: State;
    private renderer;
    private progressStep: HTMLProgressElement;
    private subscription: Subscription;
    private subscribeOnce: Subscription;
    private countryObserver: Disposable;

    private steps = {
        step1: new Step1Model(),
        step2: new Step2Model(),
        step3: new Step3Model(),
        step4: new Step4Model()
    };

    constructor(
        private store: Store<State>,
        private i18n: I18N,
        private bindingEngine: BindingEngine,
        @newInstance() private step1Controller: ValidationController,
        @newInstance() private step2Controller: ValidationController,
        @newInstance() private step3Controller: ValidationController,
        @newInstance() private step4Controller: ValidationController,
    ) {
        this.store.registerAction('nextStep', this.nextStep);
        this.store.registerAction('previousStep', this.previousStep);
        this.store.registerAction('setTotalSteps', this.setTotalSteps);
        this.store.registerAction('commitStep', this.commitStep);

        this.renderer = new BootstrapFormRenderer();

        this.initValidation();
        
        this.step1Controller.addRenderer(this.renderer);
        this.step2Controller.addRenderer(this.renderer);
        this.step3Controller.addRenderer(this.renderer);
        this.step4Controller.addRenderer(this.renderer);
    }

    initValidation() {
        this.clearController(this.step1Controller);
        this.clearController(this.step2Controller);
        this.clearController(this.step3Controller);
        this.clearController(this.step4Controller);

        this.step1Controller.addObject(this.steps.step1, Step1Rules);
        this.step2Controller.addObject(this.steps.step2, Step2Rules);
        this.step3Controller.addObject(this.steps.step3, Step3Rules);
        this.step4Controller.addObject(this.steps.step4, Step4Rules);
    }

    bind() {
        this.subscription = this.store.state.subscribe((state: State) => {
            this.state = state;

            this.steps.step1 = { ...this.steps.step1, ...state.investorQuestionnaire.step1 } as Step1Model;
            this.steps.step2 = { ...this.steps.step2, ...state.investorQuestionnaire.step2 } as Step2Model;
            this.steps.step3 = { ...this.steps.step3, ...state.investorQuestionnaire.step3 } as Step3Model;
            this.steps.step4 = { ...this.steps.step4, ...state.investorQuestionnaire.step4 } as Step4Model;

            this.initValidation();
           
            const currentStep = state.investorQuestionnaire.currentStep;

            if (currentStep === 1) {
                this.progressStep.value = 0;
            } else if (currentStep === 2) {
                this.progressStep.value = 33;
            } else if (currentStep === 3) {
                this.progressStep.value = 66;
            } else if (currentStep === 4) {
                this.progressStep.value = 100;
            }

            this.watchForCountryChange();
        });
    }

    unbind() {
        this.subscription.unsubscribe();
    }

    attached() {
        this.store.dispatch('setTotalSteps', (Object.keys(this.steps).length));

        if (this.state.investorQuestionnaire.currentStep !== 1) {
            this.store.dispatch('updateStep');
        }
    }

    detached() {
        this.step1Controller.removeRenderer(this.renderer);
        this.step2Controller.removeRenderer(this.renderer);
        this.step3Controller.removeRenderer(this.renderer);
    }
    watchForCountryChange() {
        if (this.countryObserver && this.countryObserver.dispose) {
            this.countryObserver.dispose();
        }
    
        this.countryObserver = this.bindingEngine
            .propertyObserver(this.steps.step1, 'country')
            .subscribe((newValue) => {
                if (newValue === 'AU' || newValue === 'GB') {
                    this.i18n.setLocale('en-AU');
                } else {
                    this.i18n.setLocale('en');
                }
            });
    }

    async formSubmit(event: Event) {
        event.preventDefault();

        const currentStep = this.state.investorQuestionnaire.currentStep;

        console.log(currentStep);

        if (currentStep === 1) {
            const result = await this.step1Controller.validate();

            console.log(result);
            
            if (!result.valid) {
                return;
            }

            this.store.dispatch('commitStep', 1, this.steps.step1);
        } else if (currentStep === 2) {
            const result = await this.step2Controller.validate();

            if (!result.valid) {
                return;
            }

            this.store.dispatch('commitStep', 2, this.steps.step2);
        } else if (currentStep === 3) {
            const result = await this.step3Controller.validate();

            if (!result.valid) {
                return;
            }

            this.store.dispatch('commitStep', 3, this.steps.step3);
        } else if (currentStep === 4) {
            const result = await this.step4Controller.validate();

            if (!result.valid) {
                return;
            }

            this.store.dispatch('commitStep', 4, this.steps.step4);
        }

        this.store.dispatch('nextStep');
    }

    commitStep(state: State, step, body) {
        const newState = { ...state };

        newState.investorQuestionnaire[`step${step}`] = { ...body };

        return newState;
    }

    goToPreviousStep() {
        this.store.dispatch('previousStep');
    }

    setTotalSteps(state: State, total: number) {
        const newState = { ...state };

        newState.investorQuestionnaire.totalSteps = total;

        return newState; 
    }

    nextStep(state: State) {
        const newState = { ...state };
        
        const currentStep = newState.investorQuestionnaire.currentStep;
        const totalSteps = newState.investorQuestionnaire.totalSteps;

        if ( (currentStep + 1) <= totalSteps ) {
            newState.investorQuestionnaire.currentStep++;
        }

        return newState;
    }

    previousStep(state: State) {
        const newState = { ...state };
        
        const currentStep = newState.investorQuestionnaire.currentStep;
        const totalSteps = newState.investorQuestionnaire.totalSteps;

        if ( (currentStep - 1) > 0 ) {
            newState.investorQuestionnaire.currentStep--;
        }

        return newState;
    }

    clearController(controller: ValidationController) {
        const validationEntries = Array.from((controller as any).objects);

        validationEntries.forEach(([key]) => {
            controller.removeObject(key);
        });
    }

    @computedFrom('state.investorQuestionnaire.currentStep')
    get isLastStep() {
        if (typeof this.state !== 'undefined') {
            if (this.state.investorQuestionnaire.currentStep + 1 > this.state.investorQuestionnaire.totalSteps) {
                return true;
            }
        }

        return false;
    }
}
