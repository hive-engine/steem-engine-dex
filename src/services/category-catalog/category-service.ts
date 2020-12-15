import { autoinject } from 'aurelia-framework';

import { ToastService, ToastMessage } from '../toast-service';
import { I18N } from 'aurelia-i18n';
import * as firebase from 'firebase';
import moment from 'moment';

@autoinject()
export class CategoryService {
  private db;
  private categoryPrefix = "category";

  constructor(private toast: ToastService, private i18n: I18N) {
    this.db = firebase.firestore();
  }  

  async getCategoriesByNameAndLevel(name, level, id = null) {    
    let categories = this.db.collection('categories');

    let list = categories.where("level", "==", parseInt(level)).where("name", "==", name);

    // as != is not supported we check for id's greater than and less then current id to see if the name already exists
    if (id) {
      list = list.where("id", "<", id).where("id", ">", id);
    }

    let cats = [];

    await list.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        cats.push(doc.data());
      });
    });

    return cats;
  }

  async getCategoriesBySlugAndLevel(nameSlug, level, id = null) {
    let categories = this.db.collection('categories');

    let list = categories.where("level", "==", parseInt(level)).where("nameSlug", "==", nameSlug);

    // as != is not supported we check for id's greater than and less then current id to see if the name already exists
    if (id) {
      list = list.where("id", "<", id).where("id", ">", id);
    }

    let cats = [];

    await list.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        cats.push(doc.data());
      });
    });

    return cats;
  }

  async generateNewCategoryId() {
    let newId = 1;
    let categories = this.db.collection('categories');

    await categories.orderBy("id", "desc").limit(1).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        var lastId = doc.data() && doc.data().id ? doc.data().id : 0;
        newId = parseInt(lastId) + 1;
      })
    });

    return newId;
  }

  async generateNewOrderId() {
    let newOrderId = 100;
    let categories = this.db.collection('categories');

    await categories.orderBy("orderId", "desc").limit(1).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        var lastOrderId = doc.data().orderId;
        newOrderId = parseInt(lastOrderId) + 100;
      })
    });

    return newOrderId;
  }

  async addCategory(cat) {
    const i18n = this.i18n;
    const toastService = this.toast;

    let key = this.categoryPrefix + cat.id;
    let newCat = this.db.collection("categories").doc(key);

    return newCat.set(cat).then(function () {  
      const toast = new ToastMessage();

      toast.message = i18n.tr('addCategorySuccess', {
        name: cat.name,
        level: cat.level,
        ns: 'notifications'
      });

      toastService.success(toast);

      return true;
    }).catch(function (error) {
        console.log(error);
        const toast = new ToastMessage();

        toast.message = i18n.tr('addCategoryFailure', {
          name: cat.name,
          level: cat.level,
          ns: 'errors'
        });

        toastService.error(toast);        

        return false;
    });
  }

  async updateCategory(cat) {
    const i18n = this.i18n;
    const toastService = this.toast;

    let key = this.categoryPrefix + cat.id;
    let updateCat = this.db.collection("categories").doc(key);

    return updateCat.set(cat).then(function () {
      const toast = new ToastMessage();

      toast.message = i18n.tr('updateCategorySuccess', {
        name: cat.name,
        level: cat.level,
        ns: 'notifications'
      });

      toastService.success(toast);

      return true;
    }).catch(function (error) {
      console.log(error);
      const toast = new ToastMessage();

      toast.message = i18n.tr('updateCategoryFailure', {
        name: cat.name,
        level: cat.level,
        ns: 'errors'
      });

      toastService.error(toast);

      return false;
    });
  }

  async getCategoryById(id) {
    const i18n = this.i18n;
    const toastService = this.toast;

    let catCol = this.db.collection("categories");    
    let catQ = catCol.doc(this.categoryPrefix + id);
    let cat;
    await catQ.get().then(function (doc) {
      if (doc.exists) {
        cat = doc.data();
      } else {
        const toast = new ToastMessage();

        toast.message = i18n.tr('categoryNotFound', {
          id: id,
          ns: 'errors'
        });

        toastService.error(toast);
      }
    });    

    return cat;
  }

  async disableCategory(catId) {
    let cat = await this.getCategoryById(catId);

  }

  async getCategoriesByLevel(level, orderCol = "orderId", includeParentData = false, includeDisabledCategories = false) {
    const categoryPrefix = this.categoryPrefix;
    let catCol = this.db.collection("categories");
    let list = catCol.where("level", "==", parseInt(level));

    if (!includeDisabledCategories)
      list = list.where("enabled", "==", true);

    if (orderCol == "orderId" || orderCol == "name")
      list = list.orderBy(orderCol, "asc");

    let cats = [];

    await list.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        let cat = doc.data();
        if (level > 0 && cat.parentId > 0 && includeParentData) {                    
          catCol.doc(categoryPrefix + cat.parentId).get().then(function (pDoc) {
            if (pDoc.exists) {
              cat.parentData = pDoc.data();
            }            
          });
        }

        cats.push(cat);
      });
    });

    return cats;
  }
}
