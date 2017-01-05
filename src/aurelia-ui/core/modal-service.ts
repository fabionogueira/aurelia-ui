/**
 * modal-service.ts
 * @version 1.0.1
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
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
import {Router, Redirect} from 'aurelia-router';
import {AUI} from './index';

let routerIsCanceled = false;
let containerHTMLElement; 
let modalParams = {};
let routerInstance;
let registeredCaptureCancel=[]
let modalIndex=-1;
let mouseUpTarget;
let previousRoute;

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
        return ModalService;
    }

    static show(routerName:string, param?:any){
        let r = getRouterByName(routerName);

        if (r){
            if (param){
                ModalService.setRouterParam(routerName, param);
            }

            location.hash = '#/'+r.route;
        }
    }

    static hide(routerName:string){
        let r = getRouterByName(routerName);

        if (r && `#/${r.route}`==location.hash){
            history.back();
        }
    }

    static captureCancel(fn, context?){
        ModalService.addCaptureCancel(fn, context)        
    }
    static addCaptureCancel(fn, context?){
        if (!fn.registeredCapture){
            fn.context = context;
            fn.registeredCapture = true;
            registeredCaptureCancel.push(fn);
        }
    }
    static removeCaptureCancel(fn){
        let i;

        for (i=0; i<registeredCaptureCancel.length; i++){
            if (registeredCaptureCancel[i]===fn){
                fn.context = null;
                fn.registeredCapture = null;
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
        
        if (!previousRoute){
            previousRoute = 1;
            if ( (routingContext.config.route.substring(0,6)=='modal/') ){
                return next.cancel(new Redirect('/'));
            }
        }

        if (processRegisteredCancel('back') || routerIsCanceled){
            return next.cancel();
        }

        //se rota de modal
        if (routingContext.config.route.substring(0,6)=='modal/'){           
            let url, viewModelInstance, param, viewPortInstructions,
                el = <any>document.querySelector('modal-view');

            if (el){
                viewPortInstructions = routingContext.viewPortInstructions.default;
                viewModelInstance    = viewPortInstructions.component.viewModel;
                param                = modalParams[routingContext.config.name];
                url                  = routingContext.config.moduleId+'.html';

                modalIndex++;
                
                if (viewModelInstance.setRouterParam && param){
                    viewModelInstance.setRouterParam(routingContext.config.name, param)
                }

                el.au.controller.viewModel.loadView(modalIndex, url, viewModelInstance);
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
        processRegisteredCancel('back');
        return location.hash = '#/';
    }

    if (!processRegisteredCancel('back')){
        if (!routerIsCanceled && !isModalOpennig && modalIndex > -1){
            let url, viewModel,
                canUnload = true,
                el = <any>document.querySelector('modal-view');

            if (el){
                viewModel = el.au.controller.viewModel[`viewModel${el._viewStrategyIndex}`]; //_viewStrategyIndex é adicionado no elemento em modal-view.ts

                if (viewModel && viewModel.canModalHide && viewModel.canModalHide()===false){
                    return routerIsCanceled=true;
                }

                el.au.controller.viewModel.unloadView(modalIndex--);
            }
        }
    }

    routerIsCanceled = false;
});
/*window.addEventListener('resize', ()=>{
    processRegisteredCancel('resize');
});*/
document.addEventListener('keydown', (event)=>{
    if (event.keyCode==27){
        processRegisteredCancel('key');
    }
});
document.addEventListener('mousedown', (event)=>{
    mouseUpTarget = null;
});
document.addEventListener('mouseup', (event)=>{
    mouseUpTarget = AUI.getUIRoot(<HTMLElement>event.target);
    setTimeout(function(){mouseUpTarget = null;},100);
});

function processRegisteredCancel(origin){
    let i, e, cancel=false, a=registeredCaptureCancel;

    registeredCaptureCancel = [];

    a.forEach((fn)=>{
        e = {
            "origin" : origin,
            "cancel" : false,
            "target" : mouseUpTarget
        };

        fn.apply(fn.context, [e]);
        fn.context = null;
        fn.registeredCapture = null;

        if (e.cancel){
            cancel = true;
        }
    });

    mouseUpTarget = null;

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
