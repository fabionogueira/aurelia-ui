import {inject, customAttribute} from 'aurelia-framework';

@customAttribute('code')
@inject(Element)
export class Code{
    constructor(element){ 
        //console.log(element.innerHTML);
    }
}
