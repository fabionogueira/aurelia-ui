import {inject, bindable, customElement, inlineView, bindingMode} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';
import dispatcher from '../core/dispatcher';

@inlineView('<template>'+
                 '<label>${label}</label>'+
                 '<input type="${type}" placeholder="${placeholder}" value.bind="value" />'+
                 '<ui-button tap.delegate="onButtonTap()" if.bind="showClose!==undefined"><icon src="icon-close"></icon></ui-button>'+
             '</template>')
@customElement('ui-textfield')
@inject(Element)
export class UITextfield{
    @bindable({defaultBindingMode: bindingMode.twoWay}) value: string;
    @bindable placeholder='';
    @bindable label='';
    @bindable type='text';
    @bindable showClose;

    private element;
    private timerBlur;

    constructor(element){
        this.element = element;    
        UIElementInit(this, element);
    }

    attached(){
        if (this.showClose!=undefined){
            let onFocus = ()=>{
                this.element.classList.add('focuset');
            };
            let onBlur = ()=>{
                this.timerBlur = setTimeout(()=>{
                    if (!this.value) this.element.classList.remove('focuset');
                },400);
            };

            this.element.children[1].onfocus= onFocus;
            this.element.children[1].onblur = onBlur;
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

    onButtonTap(){
        this.value = '';
        clearTimeout(this.timerBlur);
        this.element.children[1].focus();
    }
}