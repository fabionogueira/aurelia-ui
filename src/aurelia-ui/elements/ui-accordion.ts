import {inject, bindable, customElement, inlineView} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';

@inlineView('<template>'+
                 '<input type="radio" name="${name}" value="${value}"/>'+
                 '<div><span></span></div>'+
             '</template>')
@customElement('ui-accordion')
@inject(Element)
export class UICheckbox{
    @bindable opened:boolean|string=false;
   
    private element;

    constructor(element){
        this.element = element;
        UIElementInit(this, element);
    }

    attached() {
        
    }

    onTap(){
        
    }
}