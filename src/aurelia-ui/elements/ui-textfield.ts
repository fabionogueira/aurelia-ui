import {inject, bindable, customElement, inlineView, bindingMode} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';
import {DOMSelector} from '../core/index';
import dispatcher from '../core/dispatcher';

@inlineView('<template>'+
                 '<label>${label}</label>'+
                 '<input type="${type}" placeholder="${placeholder}" value.bind="value" />'+
                 '<ui-button style="display:none" click.delegate="onBtnClose_Click()"><icon src="icon-close"></icon></ui-button>'+
             '</template>')
@customElement('ui-textfield')
@inject(Element)
export class UITextfield{
    @bindable({defaultBindingMode: bindingMode.twoWay}) value: string;
    @bindable placeholder='';
    @bindable label='';
    @bindable type='text';
    @bindable showClose;

    private element:HTMLElement;
    private input:HTMLElement;
    private button:HTMLElement;

    constructor(element){
        this.element = element;    
        UIElementInit(this, element);
    }

    beforeFocus(){
        this.input.focus();
        if (this.showClose!=undefined){
            this.button.style.display = 'flex';
        }
    }

    beforeBlur(event){
        let target;

        //dispara o evento blur, evitando que entre em loop infinito
        if (event.preventLoop) return;
        dispatcher.delegate('blur', {preventLoop:true}, this.element);

        if (this.showClose!=undefined){

            //retorna o foco caso ocorreu click no botão do ui-textfield
            target = DOMSelector.closet(event.relatedTarget, 'ui-button');
            if (target==this.button){
                return this.input.focus();
            }
            
            this.button.style.display = 'none';
        }
    }

    created(){
        this.input  = <HTMLInputElement>this.element.children[1];
        this.button = <HTMLElement>this.element.children[2];

        if (this.showClose!=undefined){
            let onFocus = ()=>{
                this.beforeFocus();
            };
            let onBlur = (event)=>{
                this.beforeBlur(event);
            };

            this.input.onfocus= onFocus;
            this.input.onblur = onBlur;
        }

        if (this.element.classList.contains('floating')){
            this.label = this.placeholder;
            this.placeholder = '';
        }
    }

    valueChanged(value){
        this.element.classList[value ? 'add' : 'remove']('notnull');
        dispatcher.delegate('changed', {value:value}, this.element);
    }

    public focus(){
        this.input.focus();
    }

    private onBtnClose_Click(){
        this.value = '';
    }
}