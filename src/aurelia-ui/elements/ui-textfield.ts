import {inject, bindable, customElement, inlineView, bindingMode} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';

@inlineView('<template>'+
                 '<label>${label}</label>'+
                 '<input type="${type}" placeholder="${placeholder}" value.bind="value" />'+
             '</template>')
@customElement('ui-textfield')
@inject(Element)
export class UITextfield{
    @bindable({defaultBindingMode: bindingMode.twoWay}) value: string;
    @bindable placeholder='';
    @bindable label='';
    @bindable type='text';

    private element;

    constructor(element){
        this.element = element;    
        UIElementInit(this, element);
    }

    attached(){
        if (this.element.classList.contains('floating')){
            this.label = this.placeholder;
            this.placeholder = '';
        }
    }

    valueChanged(value){
        this.element.classList[value ? 'add' : 'remove']('notnull');
    }
}