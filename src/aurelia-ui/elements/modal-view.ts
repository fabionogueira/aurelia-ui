import {customElement, inlineView} from 'aurelia-framework';

@inlineView(`
<template>
    <compose view.bind="viewStrategy0" view-model.bind="viewModel0"></compose>
    <compose view.bind="viewStrategy1" view-model.bind="viewModel1"></compose>
    <compose view.bind="viewStrategy2" view-model.bind="viewModel2"></compose>
    <compose view.bind="viewStrategy3" view-model.bind="viewModel3"></compose>
    <compose view.bind="viewStrategy4" view-model.bind="viewModel4"></compose>
</template>`)
@customElement('modal-view')
export class ModalView {
    
    loadView(index, url, viewModel?) {
        if (index<5){
            this['viewStrategy'+index] = url;
            this['viewModel'+index] = viewModel || {};
        }
    }

    unloadView(index){
        if (index<5){
            this['viewStrategy'+index] = null;
            this['viewModel'+index] = null;
        }
    }
}