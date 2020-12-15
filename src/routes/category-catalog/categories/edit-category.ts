import { autoinject, bindable } from 'aurelia-framework';
import { ValidationControllerFactory, ControllerValidateResult, ValidationRules } from 'aurelia-validation';
import { ToastService, ToastMessage } from 'services/toast-service';
import { CategoryService } from 'services/category-service';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { I18N } from 'aurelia-i18n';
import { AppRouter } from 'aurelia-router';
import * as slugify from 'slugify';

@autoinject()
export class EditCategory {
  routeConfig;

  @bindable name;
  @bindable nameSlug;
  private parentId;
  @bindable level;
  private parentCats: ICategory[];
  private restricted;
  private image;
  private orderId;
  private id;
  private enabled;
  
  private validationController;
  private renderer;
  private loading = false;

  constructor(private toast: ToastService, private categoryService: CategoryService, private controllerFactory: ValidationControllerFactory, private i18n: I18N, private router: AppRouter) {
      this.validationController = controllerFactory.createForCurrentScope();

      this.renderer = new BootstrapFormRenderer();
      this.validationController.addRenderer(this.renderer);      
  }

  activate(params, routeConfig) {
    this.id = params.id;
  }

  async bind() {
    this.loading = true;   

    let cat = await this.categoryService.getCategoryById(this.id);
    
    this.name = cat.name;
    this.nameSlug = cat.nameSlug;
    this.level = cat.level.toString();
    this.enabled = cat.enabled;
    
    this.restricted = cat.restricted;
    this.orderId = cat.orderId;
    this.image = cat.image;
    if(this.level > 0)
      this.parentCats = await this.categoryService.getCategoriesByLevel(this.level - 1, "name");
    else
      this.parentCats = [];

    this.parentId = cat.parentId;

    this.createValidationRules();
        
    this.loading = false;
  }

  async levelChanged(newVal) {

    this.parentCats = [];

    if (newVal > 0) {      
      // get parent categories
      let cats = await this.categoryService.getCategoriesByLevel(newVal - 1, "name");
      
      if (cats) {
        cats.forEach(x => this.parentCats.push({ id: x.id, name: x.name }));
      }
    }
  }

  async nameChanged(newVal) {
    this.nameSlug = slugify.default(newVal);
  }

  async categoryAlreadyExists(name, level, id) {
    let cats = await this.categoryService.getCategoriesByNameAndLevel(name, level, id)
    if (cats && cats.length > 0) {
      return true;
    }

    return false;
  }

  async categorySlugAlreadyExists(name, level, id) {
    let cats = await this.categoryService.getCategoriesBySlugAndLevel(name, level, id)
    if (cats && cats.length > 0) {
      return true;
    }

    return false;
  }

  private createValidationRules() {
    const rules = ValidationRules
      .ensure('name')
      .required()
      .withMessageKey('errors:addCategoryNameRequired')
      .then()
      .satisfies(async (value: any, object: EditCategory) => {
        let catExists = await this.categoryAlreadyExists(value, object.level, object.id);        
        return !catExists;
      })
      .withMessageKey('errors:addCategoryNameExists')
      .ensure('nameSlug')
      .required()
      .withMessageKey('errors:addCategoryNameSlugRequired')
      .then()
      .satisfies(async (value: any, object: EditCategory) => {
        let catExists = await this.categorySlugAlreadyExists(value, object.level, object.id);
        return !catExists;
      })
      .withMessageKey('errors:addCategoryNameSlugExists')
      .ensure('level')
      .required()
      .withMessageKey('errors:addCategoryLevelRequired')
      .ensure('parentId')
      .required()
      .withMessageKey('errors:addCategoryParentRequired')
      .rules;

    this.validationController.addObject(this, rules);
  }

  get canSave() {
    return this.name && this.level >= 0 && (this.level > 0 ? this.parentId : true);
  }

  async setNewId() {
    this.id = await this.categoryService.generateNewCategoryId();
  }

  async setNewOrderId() {
    this.orderId = await this.categoryService.generateNewOrderId();
  }

  async save() {
    const i18n = this.i18n;
    const toastService = this.toast;
    const validationResult: ControllerValidateResult = await this.validationController.validate();
    const router = this.router;
    let loading = this.loading;

    loading = true;

    for (const result of validationResult.results) {
      if (!result.valid) {
        const toast = new ToastMessage();

        toast.message = i18n.tr(result.rule.messageKey, {          
          ns: 'errors'
        });

        this.toast.error(toast);        
      }
    }

    if (validationResult.valid) {
      let cat = {
        id: parseInt(this.id),
        name: this.name,
        nameSlug: this.nameSlug,
        level: parseInt(this.level),
        parentId: parseInt(this.parentId),
        restricted: this.restricted,
        image: this.image,
        orderId: parseInt(this.orderId),
        enabled: this.enabled
      } as ICategory;

      let updateResult = await this.categoryService.updateCategory(cat);
      
      if (updateResult) {
        router.navigateToRoute('categories', { level: cat.level });
      }
    }

    loading = false;    
  }

}

