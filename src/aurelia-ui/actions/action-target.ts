import {Action} from '../core/index';
import {DOMSelector} from '../core/index';
import dispatcher from '../core/dispatcher';

Action.register('target', '*', (eventName:string, selector:string, element:HTMLElement, event)=>{
    let e;
    
    if (selector){
        e = DOMSelector.find(element, selector);
        
        if (e){
            if (event._dispatcherId && e._dispatchers && event._dispatcherId==e._dispatchers[eventName]){
                return;
            }

            dispatcher.emit(eventName, event, e);
        }
    }

});
