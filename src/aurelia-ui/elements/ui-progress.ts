import {inject, customElement, inlineView, bindable} from 'aurelia-framework';
import {UIElementInit} from '../core/ui-element';

let template_circle = 
    '<svg class="@{sgv-class}" viewBox="25 25 50 50">'+
        '<circle class="@{circle-class}" cx="50" cy="50" r="20" fill="none" @{stroke} stroke-width="@{width}"/>'+
    '</svg>'+
    '<div class="ui-progress-circular-label" @{fill}></div>';

let template_bar = 
    '<div class="ui-progress-bar"></div>';

@inlineView('<template></template>')
@customElement('ui-progress')
@inject(Element)
export class UIProgress{
    @bindable type='bar';
    @bindable percent='0';
    @bindable fill=null;
    @bindable borderWidth='2';
    @bindable borderColor=null;
    @bindable showPercent=false;

    private element:HTMLElement;
    private label:HTMLElement;
    private strokeDasharray;
    private isCreated;

    constructor(element){ 
        this.element = element;
        UIElementInit(this, element);
    }

    created(){
        this.type=='circle' ?
            this.typeCicleDraw() : 
            this.typeBarDraw();

        this.isCreated = true;
    }

    percentChanged(value){
        if (this.isCreated){
            this.setPercent(value);
        }
    }

    setPercent(percent:number){
        let style;

        if (this.type=='circle'){
            let strokeDashoffset= -(this.strokeDasharray + (this.strokeDasharray * percent / 100 ));
            
            style = this.element.children[0].children[0]['style'];
            
            style['stroke-dasharray'] = String(this.strokeDasharray);
            style['stroke-dashoffset']= String(strokeDashoffset);

            this.label.innerText = percent + '%';
        }else{
            style = this.element.children[0]['style'];
            style['transform'] = `translate3d(-${100-percent}%, 0, 0)`;
        }
    }

    private typeCicleDraw(){
        let template = template_circle
            .replace('@{sgv-class}',    'ui-progress-circular' + (this.percent=='infinite' ? ' ui-progress-circular-infinite' : '') )
            .replace('@{circle-class}', 'ui-progress-circular-path' + (this.percent=='infinite' ? ' ui-progress-circular-path-infinite' : '') )
            .replace('@{width}',  this.borderWidth)
            .replace('@{fill}',   this.fill ? `style="background:${this.fill}"` : '')
            .replace('@{stroke}', this.borderColor ? `style="stroke:${this.borderColor}"` : '');
        
        this.element.className = 'ui-progress-c ' + this.element.className;
        this.element.innerHTML = template;
        this.label = <HTMLElement>this.element.children[1];

        if (this.percent!='infinite'){
            let radius = Number(this.element.children[0].children[0].getAttribute('r'));

            this.strokeDasharray = 2 * radius * Math.PI;
            this.element.children[0].setAttribute('style', 'transform:rotate(-90deg);');
            
            this.setPercent(Number(this.percent || 0));
        }
    }

    private typeBarDraw(){
        let template = template_bar;
        
        this.element.className = 'ui-progress-b ' + (this.percent=='infinite'?'ui-progress-bar-infinite ':'') + this.element.className;
        this.element.innerHTML = template;

        if (this.percent!='infinite'){
            this.setPercent(Number(this.percent || 0));
        }
    }
}
