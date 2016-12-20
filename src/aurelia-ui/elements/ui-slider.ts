import {inject, bindable, customElement, inlineView} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';

@inlineView('<template>'+
                 '<label>${label}</label>'+
                 '<div><span style="left:${x}px"></span></div>'+
             '</template>')
@customElement('ui-slider')
@inject(Element)
export class UISlider{
    private x;
    private xi;
    private dragging=false;
    private element;

    @bindable label='';
    @bindable checked=false;

    constructor(element){
        this.element = element;
        UIElementInit(this, element);
    }

    onPanleft(event){
        this.render(event.pointers[0].clientX);
    }
    onPanright(event){
        this.render(event.pointers[0].clientX);
    }
    onTap(event){
        this.render(event.pointers[0].clientX);
    }
    onTouchend(){
        let self=this;
        setTimeout(()=>{self.dragging = false;},1);
    }

    private render(x){
        let e = this.element.children[1].children[0]; 
        let r = this.element.getBoundingClientRect();

        if (!this.dragging) {            
            e.style.left = 0;
        }

        this.x = x - r.left - (e.offsetWidth/2);        
        this.dragging = true;
    }
}
