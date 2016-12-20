import {inject, bindable, customElement, inlineView} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';

@inlineView('<template>'+
                 '<label>${label}</label>'+
                 '<input type="checkbox" checked.bind="checked"/>'+
                 '<div><span></span></div>'+
             '</template>')
@customElement('ui-switch')
@inject(Element)
export class UISwitch{
    @bindable label='';
    @bindable checked=false;

    constructor(element){
        UIElementInit(this, element);
    }
}