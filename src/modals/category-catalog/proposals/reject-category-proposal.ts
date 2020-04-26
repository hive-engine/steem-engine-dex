import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue, bindable } from 'aurelia-framework';
import { ValidationControllerFactory, ControllerValidateResult, ValidationRules } from 'aurelia-validation';
import { ToastService, ToastMessage } from 'services/toast-service';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { I18N } from 'aurelia-i18n';
import { CategoryProposalService } from 'services/category-proposal-service';
//import styles from './reject-category-proposal.module.css';

@autoinject()
export class RejectCategoryProposalModal {
  @bindable handlerMessage;

  //private styles = styles;
  private loading = false;
  private proposal: any;
  private validationController;
  private renderer;

  constructor(private controller: DialogController, private toast: ToastService, private taskQueue: TaskQueue, private controllerFactory: ValidationControllerFactory, private i18n: I18N, private categoryProposalService: CategoryProposalService) {
    this.validationController = controllerFactory.createForCurrentScope();

    this.renderer = new BootstrapFormRenderer();
    this.validationController.addRenderer(this.renderer);

    this.controller.settings.lock = false;
    this.controller.settings.centerHorizontalOnly = true;
  }

  bind() {
    
  }

  async activate(proposal) {
    console.log(proposal);
    this.proposal = proposal;
  }  

  async confirmReject() {
    this.loading = true; 
    
    let result = await this.categoryProposalService.updateCategoryProposalStatus(this.proposal.key, 'Rejected', this.handlerMessage);

    if (result) {
      this.controller.ok();
    }

    this.loading = false;
  }
}
