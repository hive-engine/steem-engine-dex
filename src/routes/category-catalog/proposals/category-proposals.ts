import { autoinject } from 'aurelia-framework';
import * as firebase from 'firebase';
import { CategoryService } from 'services/category-service';
import { CategoryProposalService } from 'services/category-proposal-service';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { RejectCategoryProposalModal } from 'modals/proposals/reject-category-proposal';
import { ToastMessage, ToastService } from 'services/toast-service';
import { I18N } from 'aurelia-i18n';

@autoinject()
export class CategoryProposals {
  private level: number;
  private db;
  private proposals;
  private selectedId;

  constructor(private toast: ToastService, private i18n: I18N, private categoryService: CategoryService, private categoryProposalService: CategoryProposalService, private dialogService: DialogService) { }

  async activate(params) {
    this.level = params.level;

    this.db = firebase.firestore();
    await this.loadProposals();
  }

  async loadProposals() {
    this.proposals = await this.categoryProposalService.getCategoryProposals();    
  }

  async approve(prop) {
    let cats = await this.categoryService.getCategoriesByNameAndLevel(prop.name, prop.level);
    let catsBySlug = await this.categoryService.getCategoriesBySlugAndLevel(prop.nameSlug, prop.level);
    
    if (cats && cats.length > 0 || catsBySlug && catsBySlug.length > 0) {
      const toast = new ToastMessage();

      toast.message = this.i18n.tr("approveCategoryProposalCategoryAlreadyExists", {
        name: prop.name,
        level: prop.level,
        ns: 'errors'
      });

      this.toast.error(toast);
    } else {
      let cat = await this.mapProposalToCategory(prop);
      console.log(cat);
      let addCatResult = await this.categoryService.addCategory(cat);
      if (addCatResult) {
        let approveResult = await this.categoryProposalService.updateCategoryProposalStatus(prop.key, 'Approved');
        if (approveResult)
          this.loadProposals();
      }
    }
  }

  async mapProposalToCategory(prop) {
    let newId = await this.categoryService.generateNewCategoryId();
    let newOrderId = await this.categoryService.generateNewOrderId();

    let cat = {
      id: newId,
      name: prop.name,
      nameSlug: prop.nameSlug,
      level: parseInt(prop.level),
      parentId: parseInt(prop.parentId),
      restricted: prop.restricted,
      image: prop.image,
      orderId: newOrderId,
      enabled: true
    } as ICategory;

    return cat;
  }

  async reject(prop) {
    this.dialogService
      .open({ viewModel: RejectCategoryProposalModal, model: prop })
      .whenClosed(x => this.walletDialogCloseResponse(x));
  }

  async walletDialogCloseResponse(response: DialogCloseResult) {
    // reload balances if dialog response was success
    if (!response.wasCancelled) {
      this.loadProposals();
    }
  }
}

