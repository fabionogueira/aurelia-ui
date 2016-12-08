import {inject, processContent, noView, ViewCompiler, ViewSlot, Container} from 'aurelia-framework';

@inject(ViewCompiler)
@processContent(false)
@noView
export class Compiler {
    constructor(private viewCompiler: ViewCompiler) {}

    compile(html, context?):Function{
        let template    = `<template>${html}</template>`;
        let viewFactory = this.viewCompiler.compile(template);
        let viewSlot    = new ViewSlot(document.body, true);
        let container   = new Container();
        let view        = viewFactory.create(container);
        
        context = context || {};

        view.bind(context);
        viewSlot.attached();
        viewSlot.add(view); //adiciona no DOM
        
        return ()=>{
            viewSlot.remove(view);
        }
    }
}