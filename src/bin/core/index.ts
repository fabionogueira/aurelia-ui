import dispatcher from './dispatcher';

interface IAction{
    element  : HTMLElement
    attribute: string
    value    : string
    events   : string
}

interface ICssSelector{
    fn: Function
    v1: string
    v2: string
}

let Action_REGISTERED = {};
let DOMSelector_CACHE = {};
let setPressedState_REGISTERED = {};
let setPressedState_ACTIVE;
let setPressedState_TM

export class Action{
    static register(name:string, events:string, fn:Function):Action{
        Action_REGISTERED['action-'+name] = {
            events: events,
            do: fn 
        };
        return Action;
    }
    static do(name, ...params:any[]){
        let a = Action_REGISTERED[name];
        if (a){
            //params.splice(0,0,'');
            a.do.apply(null, params);
        }
    }
    static findElement(element):IAction[]{
        let i, a=[], attr, attrs;

        while (element && element !== document.body){
            for (attr in Action_REGISTERED){
                if (element.hasAttribute(attr)){
                    attrs = element.attributes;
                    for (i=0; i<attrs.length; i++){
                        attr = attrs[i].name;
                        if (Action_REGISTERED[attr]){
                            a.push({
                                element  : element, 
                                attribute: attr,
                                value    : element.getAttribute(attr),
                                events   : Action_REGISTERED[attr].events
                            });                            
                        }
                    }

                    return a;
                }
            }

            element = element.parentElement;
        }

        return a;
    }
}

export class AUI{
    static oldURL:string

    static setPressedState(selector:string){
        setPressedState_REGISTERED[selector] = selector;
    }
    static getUIRoot(element:HTMLElement):HTMLElement{        
        while (element && element !== document.body){
            if (element['isUIElement']){
                return element;
            }

            element = element.parentElement;
        }

        return null;
    }
    static getTransitionDuration(element:HTMLElement){
        let d = getComputedStyle(element.children[1]).transitionDuration;
        return d.indexOf('ms')>0 ? Number(d.replace('ms', '')) : Number(d.replace('s', '')) * 1000;
    }
} 

export class DOMSelector {
    
    static check = (element:HTMLElement, oSelector:ICssSelector):boolean => {
        return oSelector.fn(element, oSelector.v1, oSelector.v2);
    }
    static closet = (element:HTMLElement, selector:string):HTMLElement => {
        let oSelector = DOMSelector.init(selector);
        
        while (element && element.getAttribute){
            if (DOMSelector.check(element, oSelector)) return element;
            element = <HTMLElement>element.parentNode;
        }
        return null;
    }
    static find = (element:HTMLElement, selector:string):HTMLElement => {
        let i, c, e, oSelector = DOMSelector.init(selector);

        for (i=0; i<element.children.length; i++){
            c = element.children[i];
            if (DOMSelector.check(c, oSelector)){
                return c;
            }

            e = DOMSelector.find(c, selector);

            if (e){
                return e;
            }
        
        }

        return null;
    }
    
    static init = (selector) => {
        let fn, a, c, v1, v2;

        if (DOMSelector_CACHE[selector]){
            return DOMSelector_CACHE[selector];
        }

        c = selector.substr(0,1);

        //example:
        //#myid <element id="myid"/>
        if (c==='#'){
            fn = DOMSelector.checkById;
            v1 = selector.substr(1);
        }

        //examples:
        //  [myattribute] <element myattribute/>
        //  [myattribute=myvalue] <element myattribute="myvalue"/>
        else if (c==='['){
            fn = DOMSelector.checkByAttribute;  
            a  = selector.substr(1, selector.length-2).split('=');
            v1 = a[0];
            v2 = a[1];
        }
        
        //example:
        //.myclass <element class="myclass"/>
        else if (c==='.'){
            fn = DOMSelector.checkByClass;
            v1 = selector.substr(1);
        }
        
        //example:
        //myelement <myelement />
        else{
            fn = DOMSelector.checkByElementName;
            v1 = selector;
        }

        DOMSelector_CACHE[selector] = {
            fn: fn,
            v1: v1,
            v2: v2
        };

        return DOMSelector_CACHE[selector];
    }
    private static checkById = (element, v1)=>{
        return element.getAttribute('id')===v1;
    }
    private static checkByAttribute = (element, v1, v2)=>{
        let r = element.hasAttribute(v1);
        if (r){
            return v2 ? (element.getAttribute(v1)===v2) : true;
        }
        return false;
    }
    private static checkByClass = (element, v1)=>{
        return element.className && element.className.indexOf ? element.className.indexOf(v1)>-1 : false;
    }
    private static checkByElementName = (element, v1)=>{
        return element.localName === v1;
    }
};

['touchstart', 'mousedown'].forEach(eventName=>{
    dispatcher.on(eventName, event=>{
        let selector, oSelector, element=event.$target;
        
        while (element && element.getAttribute){
            for (selector in setPressedState_REGISTERED){
                oSelector = DOMSelector.init(selector);
                if (DOMSelector.check(element, oSelector)){
                    return setDown(element);
                }
            }
            element = element.parentNode;
        }
        
    });
});

['tap', 'touchend', 'mouseup'].forEach(event=>{
    dispatcher.on(event, e=>{
        if (setPressedState_ACTIVE){
            setUp(setPressedState_ACTIVE);
        }
    });
})

window.addEventListener("hashchange", (event)=>{
    let s1 = event.oldURL.split('#/')[1] || '';
    let s2 = event.newURL.split('#/')[1] || '';
    let s3;
    
    s1 = (s1.replace(/\//g,'_') || 'main');
    s2 = (s2.replace(/\//g,'_') || 'main');
    s3 = s1+'-'+s2

    document.body.classList.remove(document.body['hashcls']);
    document.body.classList.add(s3);

    document.body['hashcls'] = s3;
}, false);

function setDown(element){
    if (element==setPressedState_ACTIVE){
        cancelDown();
    }
    setPressedState_ACTIVE = element;
    element.setAttribute('is-pressed', '');
}
function setUp(element){
    setPressedState_TM = setTimeout(()=>{
        element.removeAttribute('is-pressed');
    },100);
}
function cancelDown(){
    clearTimeout(setPressedState_TM);
}

AUI.setPressedState('.list-item');