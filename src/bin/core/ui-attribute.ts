import {inject} from 'aurelia-framework';

@inject(Element)
export class UIAttribute{
    isUIAttribute = true;
    
    constructor(element){
        element.isUIAttribute = true;
    }
}
