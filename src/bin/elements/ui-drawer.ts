import {inject, customElement, inlineView} from 'aurelia-framework';
import {ModalService} from '../core/modal-service';
import {UIElementInit} from '../core/ui-element';
import {Action} from '../core/index';
import {AUI} from '../core/index';

let DRAWERS = {};

@inlineView(`
<template>
    <div class="ui-drawer-obfuscator" tap.delegate="onObfuscatorClick()"></div>
    <div class="ui-drawer-content">
        <slot></slot>
    </div>
</template>`)
@customElement('ui-drawer')
@inject(Element)
export class UIDrawer{
    name: string;
    element: Element;

    constructor(element){
        let name = element.getAttribute('name');

        DRAWERS[name] = element;

        this.element = element;
        UIElementInit(this, element);
    }

    attached(){
        this.element.children[1].setAttribute('style', this.element.getAttribute('style'));
        this.element.removeAttribute('style');
    }

    show(){
        this.element.setAttribute('state', 'open');            
        ModalService.addCaptureCancel(this.cancelHandle, this);
    }

    hide(){
        this.element.removeAttribute('state');
        ModalService.removeCaptureCancel(this.cancelHandle);
    }

    onObfuscatorClick(){
        if (this.element.getAttribute('state')){
            this.hide();
        }
    }

    private cancelHandle(event){
        if (this.obfuscatorIsVisible()){
            console.log(event.target)
            //if (!event.target) event.cancel = true;
            this.hide();
        }
    }

    private obfuscatorIsVisible(){
        return this.element.children[0]['offsetWidth']>0;
    }
}

Action.register('drawer', 'tap', (evt, name)=>{
    let d = DRAWERS[name];

    if (d){
        d.au.controller.viewModel.show();
    }
});

AUI.setPressedState('[action-drawer]');