/** 
 * compiler.ts
 * @version 1.0.0
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
*/

import {inject, processContent, noView, ViewCompiler, ViewSlot, Container} from 'aurelia-framework';

@inject(ViewCompiler)
@processContent(false)
@noView
export class Compiler {
    constructor(private viewCompiler: ViewCompiler) {}

    compile(html, viewModel?, complete?:Function):Function{
        let template    = `<template>${html}</template>`;
        let viewFactory = this.viewCompiler.compile(template);
        let viewSlot    = new ViewSlot(document.body, true);
        let container   = new Container();
        let view        = viewFactory.create(container);
        
        viewModel = viewModel || {};

        view.bind(viewModel);
        viewSlot.attached();
        viewSlot.add(view); //adiciona no DOM
        
        if (complete){
            complete(view);
        }

        return ()=>{
            viewSlot.remove(view);
        }
    }
}