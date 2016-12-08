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

import {inject, noView, ViewCompiler, ViewResources, Container, ViewSlot, createOverrideContext} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {DOMSelector} from './index';
import {Compiler} from './compiler';

declare var require:any;

let modalVisible = [];
let isCancel = false;
let containerHTMLElement; 
let modalParams = {};
let routerInstance;
let registeredCaptureCancel=[]

if (!location.hash){
    location.hash = '#/';
}

@inject(ViewCompiler, ViewResources, Container, Router)
export class ModalService {
    private viewCompiler
    private resources
    private container

    constructor(viewCompiler, resources, container, router) {
        this.viewCompiler = viewCompiler;
        this.resources = resources;
        this.container = container;
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

    static captureCancel(fn){
        registeredCaptureCancel.push(fn);        
    }

    configure(config){
        let modalStep = new ModalStep(this);
        config.addPipelineStep('authorize', modalStep);
    }

    insert(containerElement, html, viewModel, routingContext) {
        let viewFactory = this.viewCompiler.compile(html);
        let view = viewFactory.create(this.container);
        let anchorIsContainer = true;
        let viewSlot = new ViewSlot(containerElement, anchorIsContainer);
        let routerParam;

        viewSlot.add(view);
        viewSlot.attached();

        if (typeof(viewModel.modalAttached)=='function'){
            viewModel.modalAttached(containerElement.lastElementChild);
        }

        view.bind(viewModel, createOverrideContext(viewModel));
        
        routerParam = modalParams[routingContext.config.name];
        delete(modalParams[routingContext.config.name]);

        if (viewModel.setRouterParam){
            viewModel.setRouterParam(routerParam);
        }
        
        modalVisible.push(viewModel);
        
        viewModel.$$index = modalVisible.length-1;
        viewModel.closeModal = () => {
            modalVisible.splice(viewModel.$$index,1);
            viewSlot.remove(view);
            view.unbind();
        };

        if (typeof(viewModel.modalShow)=='function'){
            viewModel.modalShow();
        }
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
            let modalService = this.modalService;
            let viewPortInstructions = routingContext.viewPortInstructions.default;
            
            require(["text!"+routingContext.config.moduleId+'.html'], function(html){
                let viewModel = viewPortInstructions.component.viewModel;

                if (!containerHTMLElement){
                    containerHTMLElement = document.body.appendChild(document.createElement('div'));
                    containerHTMLElement.style.cssText='display:block;position:fixed;top:0;left:0;z-index:999';
                }

                modalService.insert(containerHTMLElement, html, viewModel, routingContext);
            });

            isCancel = true;

            return next.cancel();
        }


        return next();
    }
}

window.addEventListener('popstate', (event) => {
    let isModalOpennig = location.hash.substring(0,7) === '#/modal';
    
    if (!location.hash){
        return location.hash = '#/';
    }

    if (!isCancel && !isModalOpennig && modalVisible.length>0){
        let viewModel = modalVisible[modalVisible.length-1];
      
        viewModel.closeModal();
    }

    isCancel = false;
});
document.addEventListener('keydown', (event)=>{
    if (event.keyCode==27){
        processRegisteredCancel('key');
    }
})

function processRegisteredCancel(origin){
    let i, e, cancel=false;

    registeredCaptureCancel.forEach((fn)=>{
        e = {
            "origin": origin,
            "cancel": false
        };

        fn(e);

        if (e.cancel){
            cancel = true;
        }
    });

    registeredCaptureCancel = [];

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