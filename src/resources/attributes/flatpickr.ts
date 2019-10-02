import Flatpickr from 'flatpickr';

import 'flatpickr/dist/flatpickr.css';

import { customAttribute, inject, TaskQueue, dynamicOptions } from 'aurelia-framework';

const BaseConfiguration: Flatpickr.Options.Options = {
    allowInput: true,
    altFormat: 'm/d/Y',
    dateFormat: 'Y-m-d h:i K',
    altInput: true
};

@customAttribute('flatpickr')
@dynamicOptions()
@inject(Element, TaskQueue)
export class FlatpickrAttribute {
  public flatpickr: Flatpickr.Instance;

  private initialDate = false;
  private element: HTMLInputElement;
  private options: Flatpickr.Options.Options = { ...BaseConfiguration };

  private guard = false;

  constructor(element: HTMLInputElement, private taskQueue: TaskQueue) {
    this.element = element;
  }

  attached(): void {
    this.flatpickr = Flatpickr(this.element, this.options) as Flatpickr.Instance;

    this.element.addEventListener('input', this.dateChanged);

    this.dateChanged();
  }

  detached(): void {
    this.element.removeEventListener('input', this.dateChanged);
    this.flatpickr.destroy();
  }

  propertyChanged(propertyName, newValue) {
    if (this.flatpickr) {
      this.flatpickr.set(propertyName, newValue);
    } else {
      if (propertyName === 'initialDate') {
        this.initialDate = newValue;
      } else {
        this.options[propertyName] = newValue;
      }
    }
  }

  dateChanged = () => {
    if (!this.guard) {
      let formattedValue: string | Date = this.element.value;

      if (typeof (this.element.value) === 'undefined' || this.element.value === '' || !this.flatpickr || !formattedValue && !this.options.defaultDate) {
        return;
      }

      if (!formattedValue && this.options.defaultDate) {
        formattedValue = new Date();
      }

      formattedValue = new Date(formattedValue).toISOString();
      this.guard = true;
      this.flatpickr.setDate(formattedValue);

      this.taskQueue.queueMicroTask(() => this.guard = false);
    }
  }
}
