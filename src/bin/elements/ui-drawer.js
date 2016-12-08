import {customElement} from 'aurelia-framework';
import {UIComponent} from '../ui-component';

@customElement('ui-drawer')
export class UIDrawerCustomElement extends UIComponent{
    onTap(event){
        console.log(event);
    }
}