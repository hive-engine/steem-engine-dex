import { inject, Parent, View, getContextFor, Scope } from 'aurelia-framework';

const removeClassList = (element, val) => {
  if (!val) {
    return;
  }

  element.classList.remove(val);
};

const addClassList = (element, val) => {
  if (!val) {
    return;
  }

  element.classList.add(val);
};

@inject(Element, Parent.of(ClassCustomAttribute))
export class ClassCustomAttribute {
  value: string;
  previousClasses: string[] = [];
  bindingContext;
  parentContext;

  constructor(private element: Element, private parent: any) { }

  bind(bindingContext, overrideContext) {
    this.bindingContext = bindingContext;

    if (this.bindingContext && typeof this.bindingContext.styles === 'undefined') {
      this.bindingContext = this.parent.bindingContext;

      if (this.bindingContext && typeof this.bindingContext.styles === 'undefined') {
        this.bindingContext = getContextFor(
          'styles',
          { bindingContext, overrideContext },
          0
        );
      }
    }

    if (!this.bindingContext || typeof this.bindingContext.styles === 'undefined') {
      return;
    }

    if (!this.value) {
      this.value = '';
    }

    // Filter out any classes that do not have substitutes found in the bindingContext styles property
    // this prevents them being removed and allows for use-cases where :global {} is being used
    const values = this.value.split(' ').filter((val, index) => {
      return this.bindingContext.styles[val];
    });

    values.forEach(x => removeClassList(this.element, x)); // remove the initial friendly names

    this.valueChanged(this.value);
  }

  addClass(className: string) {
    this.value = `${this.value} ${className}`;
  }

  removeClass(className: string) {
    this.value = this.value
      .split(' ')
      .filter(x => x !== className)
      .join(' ');
  }

  valueChanged(newValue: string) {
    if (!this.bindingContext) {
        return;
    }

    this.previousClasses.forEach(x => removeClassList(this.element, x));

    this.previousClasses = newValue
        .split(' ')
        .map(x => x.trim())
        .map(x =>
            this.bindingContext.styles[x] ? this.bindingContext.styles[x] : x
        )
        .join(' ')
        .split(' ');

    this.previousClasses.forEach(x => addClassList(this.element, x));
  }
}
