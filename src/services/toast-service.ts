import { autoinject } from 'aurelia-dependency-injection';
import izitoast, { IziToastSettings, IziToastProgress } from 'izitoast';

@autoinject()
export class ToastService implements Toast {

  private defaultOptions: ToastOptions = {
    class: 'se-toast',
    position: 'bottomCenter',
    theme: 'light',
    layout: 1,
    title: '',
    titleColor: '#FFFFFF',
    messageColor: '#FFFFFF',
    iconColor: '#FFFFFF',
    backgroundColor: '#09A47A',
    close: true,
    closeOnEscape: true,
    closeOnClick: true,
    timeout: 3000,
    overlay: false,
    transitionIn: 'fadeInUp',
    transitionOut: 'fadeOutDown',
  };

  constructor() {
    izitoast.settings(this.defaultOptions);
  }

  setDefaultOptions(options: ToastOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    izitoast.settings(this.defaultOptions);
  }

  getDefaultOptions(): ToastOptions {
    return this.defaultOptions;
  }

  destroyAllToasts(): void {
    izitoast.destroy();
  }

  show(toast: ToastMessage): boolean | void {
    return izitoast.show(this.mergeToastSettings(toast));
  }

  hide(toastRef: string | HTMLDivElement, toast?: ToastMessage, closedBy?: string): void {
    izitoast.hide(this.mergeToastSettings(toast, false), toastRef, closedBy);
  }

  public info(toast: ToastMessage): void {
    izitoast.info(this.mergeToastSettings(toast));
  }

  progress(toastRef: HTMLDivElement, toast?: ToastMessage, callback?: () => void): ToastProgress {
    return izitoast.progress(this.mergeToastSettings(toast, false), toastRef, callback);
  }

  success(toast: ToastMessage): void {
    izitoast.success(this.mergeToastSettings(toast));
  }

  warning(toast: ToastMessage): void {
    izitoast.warning(this.mergeToastSettings(toast));
  }

  error(toast: ToastMessage): void {
    toast.overrideOptions.timeout = toast.overrideOptions.timeout || false;
    toast.overrideOptions.layout = toast.overrideOptions.layout || 2;
    izitoast.error(this.mergeToastSettings(toast));
  }

  question(toast: ToastMessage): void {
    izitoast.question(this.mergeToastSettings(toast));
  }

  private mergeToastSettings(toast: ToastMessage, toastMessageIsRequired = false): IziToastSettings {
    if (toastMessageIsRequired && (!toast || !toast.message || !toast.message.length)) {
      throw new Error('Toast message cannot be empty if "toastMessageIsRequired" is true!');
    }
    return toast ? { ...toast.overrideOptions, ...{ message: toast.message || '', title: toast.title || '' } } : {};
  }
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ToastOptions extends Omit<IziToastSettings, 'message'> { }

export interface ToastProgress extends IziToastProgress { }

export class ToastMessage {
  constructor(
    public message?: string,
    public title?: string,
    public overrideOptions: ToastOptions = {}
  ) { }
}

export interface Toast {
  setDefaultOptions(options: ToastOptions): void;
  getDefaultOptions(): ToastOptions;
  destroyAllToasts(): void;
  show(toast: ToastMessage): void | boolean;
  hide(toastRef: HTMLDivElement | string, toast?: ToastMessage, closedBy?: string): void;
  progress(toastRef: HTMLDivElement, toast?: ToastMessage, callback?: () => void): ToastProgress;
  info(toast: ToastMessage): void;
  success(toast: ToastMessage): void;
  warning(toast: ToastMessage): void;
  error(toast: ToastMessage): void;
  question(toast: ToastMessage): void;
}
