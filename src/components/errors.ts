import { customElement, bindable, inlineView } from 'aurelia-framework';

@customElement('errors')
@inlineView(`
<template>
<div class="row">
<div class="col-6">
    <ul class="errors">
        <li repeat.for="error of errors">
            \${error}
        </li>
    </ul>
</div>
</div>
</template>
`)
export class Errors {
    @bindable() errors;
}
