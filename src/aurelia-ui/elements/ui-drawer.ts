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
    transitionDuration:number;

    constructor(private element:HTMLElement){
        let name = element.getAttribute('name');
        
        DRAWERS[name] = element;

        this.element = element;
        UIElementInit(this, element);
    }

    attached(){
        this.transitionDuration = AUI.getTransitionDuration(this.element);
        this.element.children[1].setAttribute('style', this.element.getAttribute('style'));
        this.element.removeAttribute('style');
        this.updateDocumentBody();
    }

    show(){
        this.element.setAttribute('state', 'open');           
        this.updateDocumentBody();
        ModalService.addCaptureCancel(this.cancelHandle, this);
    }

    hide(fn?){        
        this.element.removeAttribute('state');
        this.updateDocumentBody(true);
        ModalService.removeCaptureCancel(this.cancelHandle);

        if (fn){
            setTimeout(()=>{fn();}, this.transitionDuration);
        }
    }

    onObfuscatorClick(){
        this.hide();
    }

    private cancelHandle(event){
        let hash;

        if (this.obfuscatorIsVisible()){

            event.cancel = true;
            
            //tem event.target quando a mudança de rota é resultado de click em link (href) 
            if (event.target){
                //aguarda o ui-drawer fechar para mudar de rota
                hash = location.hash;
                this.hide(()=>{
                    location.hash = hash; 
                });
            }else{
                //um cancelamento normal (esc, backspace, back button)
                this.hide();
            }

        }
    }

    private obfuscatorIsVisible(){
        return (<HTMLElement>this.element.children[0]).offsetWidth>0;
    }

    private contentIsVisible(){
        let r = (<HTMLElement>this.element.children[1]).getBoundingClientRect();
        return r.left>=0 || r.right>=0;
    }

    private updateDocumentBody(forceHide=false){
        if (forceHide || !this.contentIsVisible()){
            document.body.classList.remove('drawer-open');
        }else{
            document.body.classList.add('drawer-open');
        }
    }
}

Action.register('drawer', 'tap', (evt, name)=>{
    let d = DRAWERS[name];

    if (d){
        d.au.controller.viewModel.show();
    }
});

AUI.setPressedState('[action-drawer]');