import { autoinject } from 'aurelia-framework';

import { ToastService, ToastMessage } from '../toast-service';
import { I18N } from 'aurelia-i18n';
import * as firebase from 'firebase';
import moment from 'moment';

@autoinject()
export class CategoryProposalService {
  private db;
  private categoryPrefix = "category";

  constructor(private toast: ToastService, private i18n: I18N) {
    this.db = firebase.firestore();
  }

  async getCategoryProposals() {
    let proposals = this.db.collection('categoryProposals').orderBy("timestamp");
    let props = [];

    await proposals.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        let prop = doc.data();
        prop.key = doc.id;
        prop.timestamp_string = moment.unix(prop.timestamp).format('YYYY-MM-DD HH:mm');
        if (prop.handlingTimestamp) {
          prop.handlingTimestamp_string = moment.unix(prop.timestamp).format('YYYY-MM-DD HH:mm');
        }
        props.push(prop);
      });
    });

    return props;
  }

  async addCategoryProposal(proposal) {
    const i18n = this.i18n;
    const toastService = this.toast;

    let newCat = this.db.collection("categoryProposals").doc();

    return newCat.set(proposal).then(function () {
      const toast = new ToastMessage();

      toast.message = i18n.tr('addCategoryProposalSuccess', {
        name: proposal.name,
        level: proposal.level,
        ns: 'notifications'
      });

      toastService.success(toast);

      return true;
    }).catch(function (error) {
      console.log(error);
      const toast = new ToastMessage();

      toast.message = i18n.tr('addCategoryProposalFailure', {
        name: proposal.name,
        level: proposal.level,
        ns: 'errors'
      });

      toastService.error(toast);

      return false;
    });
  }

  async getCategoryProposalByKey(key) {
    const i18n = this.i18n;
    const toastService = this.toast;

    let catCol = this.db.collection("categoryProposals");
    let catQ = catCol.doc(key);
    let cat;
    await catQ.get().then(function (doc) {
      if (doc.exists) {
        cat = doc.data();
      } else {
        const toast = new ToastMessage();

        toast.message = i18n.tr('categoryProposalNotFound', {
          id: key,
          ns: 'errors'
        });

        toastService.error(toast);
      }
    });

    return cat;
  }

  async updateCategoryProposalStatus(key, status, handlerMessage = "") {
    const i18n = this.i18n;
    const toastService = this.toast;

    let prop = await this.getCategoryProposalByKey(key);
    prop.status = status;
    prop.handledBy = "lion200";
    prop.handlerMessage = handlerMessage;
    prop.handlingTimestamp = moment().unix();

    let proposals = this.db.collection("categoryProposals").doc(key);

    return proposals.set(prop).then(function () {
      const toast = new ToastMessage();

      toast.message = i18n.tr('categoryProposalStatusChange', {
        name: prop.name,
        level: prop.level,
        status: prop.status,
        ns: 'notifications'
      });

      toastService.success(toast);

      return true;
    }).catch(function (error) {
      console.log(error);
      const toast = new ToastMessage();

      toast.message = i18n.tr('categoryProposalStatusChangeFailure', {
        name: prop.name,
        level: prop.level,
        ns: 'errors'
      });

      toastService.error(toast);

      return false;
    });
  }

  async getCategoryProposalsByNameAndLevel(name, level, id = null) {
    let props = this.db.collection('categoryProposals');

    let list = props.where("level", "==", parseInt(level)).where("name", "==", name);

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
}
