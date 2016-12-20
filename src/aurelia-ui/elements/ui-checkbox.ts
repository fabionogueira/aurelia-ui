import {inject, bindable, customElement, inlineView} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';

@inlineView('<template>'+
                 '<input type="checkbox" checked.bind="checked"/>'+
                 '<div><span></span></div>'+
             '</template>')
@customElement('ui-checkbox')
@inject(Element)
export class UICheckbox{
    @bindable checked:boolean|string=false;

    private element;

    constructor(element){
        this.element = element;
        UIElementInit(this, element);
    }

    attached() {
        this.checked = this.checked==='true' || this.checked===true ? true : false;
        this.element.children[0].checked = this.checked;
    }

    onTap(){
        this.checked = !this.checked;
    }
}