/**
 * ui-alert.ts
 * @version 1.0.0
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
 * 
 * @example
 * alert.show('Simple alert show', 'Aurelia UI');
 * alert.show('Are you feel good today?', 'Aurelia UI', ['Cancelar', '<b>OK</b>'])
 *      .on('hide', (index)=>{
 *           console.log(index);
 *       });
 * let template = '<ui-textfield value.bind="data.name" style="flex:1;" placeholder="What is your name"></ui-textfield>';
 * alert.show('What is your name?', 'Aurelia UI', ['Cancelar', '<b>OK</b>'], template)
 *      .on('show', (data)=>{
 *          data.name = 'initial name';
 *      })
 *      .on('hide', (index, data)=>{
 *          console.log(index, data);
 *          //output: {name:}
 *      });
 *  
 * 
 */
import {inject, noView} from 'aurelia-framework';
import {Compiler} from './compiler';
import {ModalService} from './modal-service';

let oldActiveFocus;

@noView
@inject(Compiler)
export class UIAlert{
    private events = {};

    constructor(private compiler: Compiler, private remove) {
        this.context = {
            UIAlert : this,
            onTap   : null,
            data    : null
        } 
    }

    context:{
        UIAlert     : UIAlert,
        onTap(index): any,
        data        : any
    }

    show(text, title:string='', buttons:string[]=['OK'], html:string=''){
        let buttonsStr = '', template;

        buttons.forEach((btText, i)=>{
            buttonsStr += (`<ui-button tap.delegate="onTap(${i})" class="modal-button">${btText}</ui-button>`);
        });
        
        template =
        `<div class="au-animate modal modal-overlay"> 
            <div class="vbox modal-alert" tabindex="1" style="outline:none;">
                <div class="vbox">`+
                    (title ? (`<div class="modal-alert-title">${title}</div>`) : '' )+
                    `<div class="modal-alert-text">${text}</div>`+
                    (html ? (`<div class="modal-alert-content">${html}</div>`) : '')+
                '</div>'+
                `<div class="hbox modal-alert-buttons">
                    ${buttonsStr}
                </div>
            </div>
        </div>`;

        this.context.UIAlert = this;
        this.context.onTap = (index) => {this.context.UIAlert.hide(index);}
        this.context.data = {};

        oldActiveFocus = document.activeElement;

        this.remove = this.compiler.compile(template, this.context, (viewElement)=>{
            viewElement.firstChild.children[0].focus();
        });

        ModalService.captureCancel(this.cancelHandle, this);

        return {
            on:(evt, fn)=>{
                this.events[evt] = {
                    fn: fn
                };
            }
        }
    }

    private cancelHandle(event){
        event.cancel = true;
        this.hide(event.origin=='key' ? 27 : -1);
    }

    hide(index?){
        let o, e;

        if (this.remove){
            ModalService.removeCaptureCancel(this.cancelHandle);

            this.remove();
            
            delete(this.context.UIAlert);
            delete(this.context.onTap);

            e = this.events['hide'];
            this.events['hide'] = null;

            if (e){
                o = JSON.parse(JSON.stringify(this.context.data));                
                e.fn(index, o);
            }

            if (oldActiveFocus){
                oldActiveFocus.focus();
            }

            oldActiveFocus = null;
        }
    }
}
