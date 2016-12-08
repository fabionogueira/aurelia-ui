import {Action} from '../core/index';
import {DOMSelector} from '../core/index';
import dispatcher from '../core/dispatcher';

Action.register('target', '*', (eventName:string, selector:string, element:HTMLElement, event)=>{
    let e;
    
    if (selector){
        e = DOMSelector.find(element, selector);
        if (e){
            dispatcher.emit(eventName, event, e);
        }
    }

});
