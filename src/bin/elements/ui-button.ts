import {inject, customElement, inlineView} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';
import {AUI} from '../core/index';

@inlineView('<template><slot></slot></template>')
@customElement('ui-button')
@inject(Element)
export class UIButton{
    constructor(element){ 
        UIElementInit(this, element);
    }
}

AUI.setPressedState('ui-button');