/**
 * @credits: http://stackoverflow.com/questions/29527389/how-do-you-use-viewcompiler-to-manually-compile-part-of-the-dom
 * @example
 * 
    @inject(ModalService)
    export class App {
        private router

        constructor(modalService){
            this.modalService = modalService;
        }

        configureRouter(config, router) {
            this.modalService.configure(config);

            //a rota deve começar com modal/
            config.map([{route:'modal/myview'}]
        }
    }
 */

import {inject, noView, } from 'aurelia-framework';
import {Router} from 'aurelia-router';

let routerIsCanceled = false;
let containerHTMLElement; 
let modalParams = {};
let routerInstance;
let registeredCaptureCancel=[]
let modalIndex=-1;

if (!location.hash){
    location.hash = '#/';
}

@inject(Router)
export class ModalService {

    constructor(router) {
        routerInstance = router;
    }
 
    static setRouterParam(routerName, param){
        modalParams[routerName] = param;
    }

    static show(routerName, param){
        let r = getRouterByName(routerName);

        if (r){
            if (param){
                ModalService.setRouterParam(routerName, param);
            }

            location.hash = '#/'+r.route;
        }
    }

    static captureCancel(fn, context?){
        fn.context = context;
        registeredCaptureCancel.push(fn);        
    }
    static removeCaptureCancel(fn){
        let i;

        for (i=0; i<registeredCaptureCancel.length; i++){
            if (registeredCaptureCancel[i]===fn){
                fn.context = null;
                return registeredCaptureCancel.splice(i,1);
            }
        }        
    }

    configure(config){
        let modalStep = new ModalStep(this);
        config.addPipelineStep('authorize', modalStep);
    }
}

class ModalStep {
    private modalService;

    constructor(modalService){
        this.modalService = modalService;
    }

    run(routingContext, next) {
        
        if (processRegisteredCancel('back')){
            return next.cancel();
        }

        //se rota de modal
        if (routingContext.config.route.substring(0,6)=='modal/'){           
            let url, el = <any>document.querySelector('modal-view');
            let viewPortInstructions = routingContext.viewPortInstructions.default;

            if (el){
                modalIndex++;
                url = routingContext.config.moduleId+'.html';
                el.au.controller.viewModel.loadView(modalIndex, url, viewPortInstructions.component.viewModel);
            }

            routerIsCanceled = true;

            return next.cancel();
        }

        return next();
    }
}

window.addEventListener('popstate', (event) => {
    let isModalOpennig = location.hash.substring(0,8) === '#/modal/';
    
    if (!location.hash){
        return location.hash = '#/';
    }

    if (!routerIsCanceled && !isModalOpennig && modalIndex > -1){
        let url, el = <any>document.querySelector('modal-view');
        if (el){
            el.au.controller.viewModel.unloadView(modalIndex--);
        }
    }

    routerIsCanceled = false;
});
document.addEventListener('keydown', (event)=>{
    if (event.keyCode==27){
        processRegisteredCancel('key');
    }
})

function processRegisteredCancel(origin){
    let i, e, cancel=false, a=registeredCaptureCancel;

    registeredCaptureCancel = [];

    a.forEach((fn)=>{
        e = {
            "origin": origin,
            "cancel": false
        };

        fn.apply(fn.context, [e]);
        fn.context = null;

        if (e.cancel){
            cancel = true;
        }
    });


    return cancel;
}
function getRouterByName(routerName){
    let i, r=routerInstance.routes;

    for (i=0; i<r.length; i++){
        if (r[i].name==routerName){
            return r[i];
        }
    }

    return null;
}