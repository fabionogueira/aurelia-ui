import {inject, customElement, inlineView} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';

@inlineView('<template><slot></slot></template>')
@customElement('ui-drawer')
@inject(Element)
export class UIButton{
    constructor(element){ 
        UIElementInit(this, element);
    }
}
