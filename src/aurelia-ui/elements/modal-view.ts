/**
 * modal-view.ts
 * @version 1.0.0
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
 */

import {inject, customElement, inlineView} from 'aurelia-framework';

@inlineView(`
<template>
    <compose view.bind="viewStrategy0" view-model.bind="viewModel0"></compose>
    <compose view.bind="viewStrategy1" view-model.bind="viewModel1"></compose>
    <compose view.bind="viewStrategy2" view-model.bind="viewModel2"></compose>
    <compose view.bind="viewStrategy3" view-model.bind="viewModel3"></compose>
    <compose view.bind="viewStrategy4" view-model.bind="viewModel4"></compose>
</template>`)
@inject(Element)
@customElement('modal-view')
export class ModalView {
    
    constructor(private element:HTMLElement){
    }

    loadView(index, url, viewModel?, complete?:Function) {
        let vm;

        if (index<5){
            vm = viewModel || {};

            this['viewStrategy'+index] = url;
            this['viewModel'+index] = vm;
            
            this.element['_viewStrategyIndex'] = index;
            this.element.children[index].classList.add('modal-activate');
        }
    }

    unloadView(index){
        let e, wait;

        if (index<5){
            e = this.element.children[index];

            this['viewStrategy'+index] = null;
            this['viewModel'+index] = null;

            wait = () => {
                if (e.children.length===0){
                    return e.classList.remove('modal-activate');
                }

                setTimeout(wait, 10)
            };

            wait();
        }
    }
}


