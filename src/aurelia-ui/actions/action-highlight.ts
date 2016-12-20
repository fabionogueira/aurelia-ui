import {Action} from '../core/index';
import dispatcher from '../core/dispatcher';

let isPressedElement, tm;

Action.register('highlight', 'mousedown mouseup', (eventName, value, element, event)=>{
    let e;
    
    if (eventName==='mousedown'){
        isPressedElement = element;
        element.setAttribute('is-pressed', 'yes');
    }
});

dispatcher.on('mouseup', (event)=>{
    if (isPressedElement){
        isPressedElement.setAttribute('is-pressed', 'no');
        isPressedElement = null;
    }
});