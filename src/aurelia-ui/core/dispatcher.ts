import device from './device';
import support from './support';
import {Action, AUI} from './index';

declare var Hammer:any;

let dispatcherId = 0;;
let GLOBAL_OBSERVERS = {};
let HAMMER = new Hammer(document.body);
let OLD_ACTIVE_ELEMENT={element:null, parents:[]};
let MD_TARGET;
let EVENTS_TRANSLATE = {
    tap: 'tap',
    press: 'longpress',
    panleft: 'panleft',
    panright: 'panright'
};
let dispatcher = {
    /**
     * @example
     * dispatcher.emit('tap', {v1}, element);
     * dispatcher.emit('tap', {v:1})
     */
    emit: (eventName:string, event, element?:HTMLElement) => {
        let g, controller, fn, customEvent;
        
        dispatcherId++;

        event = event || {};
        event.$target = element || getTargetElement(event) || element;
        registerDispatcherId(event, eventName, event.$target, dispatcherId);
        
        customEvent = createEvent(eventName, event);
        registerDispatcherId(customEvent, eventName, event.$target, dispatcherId);

        //chama a função definida na viewModel correspondente ao evento
        if (element){
            controller = element['au'].controller;
            if (controller){
                fn = controller.viewModel['on'+eventName[0].toUpperCase()+eventName.substring(1)];
                if (fn){
                    fn.call(controller.viewModel, event);
                }
            }
        }
        
        //dispacha o evento registrado globalmente
        g = GLOBAL_OBSERVERS[eventName];
        if (g){
            g.forEach(fn=>{
                fn(customEvent);
            })
        }

        //dispacha o evento para as instâncias do custom element
        event._dispatcher = customEvent._dispatcher = true;
        if (event.$target) event.$target.dispatchEvent(customEvent);
    },

    delegate: (eventName:string, event, element:HTMLElement) => {
        let g, customEvent;
        
        event = event || {};
        customEvent = createEvent(eventName, event);
        
        //dispacha o evento registrado globalmente
        g = GLOBAL_OBSERVERS[eventName];
        if (g){
            g.forEach(fn=>{
                fn(customEvent);
            })
        }

        //dispacha o evento para as instâncias do custom element
        customEvent._dispatcher = true;
        element.dispatchEvent(customEvent);
    },

    on: (eventName:string, fn:Function)=>{
        if (!GLOBAL_OBSERVERS[eventName]){
            GLOBAL_OBSERVERS[eventName] = [];
        }
        
        fn['$event_'+eventName] = true;
        GLOBAL_OBSERVERS[eventName].push(fn);
    },

    off: (eventName:string, fn:Function) => {
        let i, fns, off = fn['$event_'+eventName];

        if (off){
            delete(fn['$event_'+eventName]);
            fns = GLOBAL_OBSERVERS[off.eventName];
            for (i=0; i<fns.length; i++){
                if (fns[i]===fn){
                    fns.a.splice(i,1);
                    break;
                }
            }
        }
    },

    updateActiveElement: updateActiveElement
}

function registerDispatcherId(event, name, element, id){
    event._dispatcherId = id;
    if (element){
        element._dispatchers = element._dispatchers || {};
        element._dispatchers[name] = id;
    }
}
function updateActiveElement(){
    setTimeout(()=>{
        let a=[], element = document.activeElement;
        
        if (OLD_ACTIVE_ELEMENT.element){
            OLD_ACTIVE_ELEMENT.element.setAttribute('ui-element', '');
            OLD_ACTIVE_ELEMENT.parents.forEach(e=>{
                e.setAttribute('set-active', '');
            });
        }

        OLD_ACTIVE_ELEMENT.parents = [];
        OLD_ACTIVE_ELEMENT.element = null;

        while (element !== document.body){
            if (element.getAttribute('set-active')!=null){
                a.push(element);
            }

            if (element.getAttribute('ui-element')!=null){
                OLD_ACTIVE_ELEMENT.element = element;
                OLD_ACTIVE_ELEMENT.parents = a;
            }

            element = element.parentElement;
        }

        if (OLD_ACTIVE_ELEMENT.element){
            OLD_ACTIVE_ELEMENT.element.setAttribute('ui-element', 'active');
                 
            OLD_ACTIVE_ELEMENT.parents.forEach(e=>{
                e.setAttribute('set-active', 'yes');
            });
        }

    },10);

    return null;
}
function createEvent(name, options){
    let i, d, customEvent;

    if (window['customEvent']) {
        customEvent = new CustomEvent(name, { bubbles: true });
    } else {
        customEvent = document.createEvent("CustomEvent");
        customEvent.initCustomEvent(name, true, true, {});
    }
    for (i in options){
        if (customEvent[i]===undefined ){
            customEvent[i] = options[i];
            continue;
        }

        if (customEvent[i]===null){
            d = Object.getOwnPropertyDescriptor(customEvent, i);
            if (d && d.writable){
                customEvent[i] = options[i];
            }
        }
    }

    return customEvent;
}
function eventsHandle(event){
    let e, actions;

    if (event._dispatcher) return;

    e = EVENTS_TRANSLATE[event.type];
    updateActiveElement();
    
    if (!event._dispatcher){
        dispatcher.emit(event.type, event, AUI.getUIRoot(getTargetElement(event)));

        //dispara as definições de actions
        Action.findElement(event.target).forEach(action=>{
            if (action.events=='*' || action.events.search(event.type)>=0) {
                Action.do(action.attribute, event.type, action.value, action.element, event);
            }
        });

    }

    event._dispatcher = true;
}
function getTargetElement(event){
    return event.toElement || event.srcElement || event.target || event.touches && event.touches[0].target;
}

HAMMER.on("panleft panright tap press", eventsHandle);
document.addEventListener('keydown', (event)=>(event.keyCode==9) ? updateActiveElement(): null);
window.addEventListener('blur', updateActiveElement);
document.addEventListener(support.touch ? 'touchstart' : 'mousedown', (event)=>{
    MD_TARGET = event.target;
    eventsHandle(event);
});
document.addEventListener(support.touch ? 'touchend' : 'mouseup', (event)=>{
    if (MD_TARGET){
        MD_TARGET = null;
        eventsHandle(event);
    }
});

export default dispatcher;