/**
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

@noView
@inject(Compiler)
export class UIAlert{
    private events = {};
    private data = {};

    constructor(private compiler: Compiler, private remove) {}

    onTap(index){
        this.hide(index);
    }

    show(text, title:string='', buttons:string[]=['OK'], html:string=''){
        let buttonsStr = '', template;

        buttons.forEach((btText, i)=>{
            buttonsStr += (`<ui-button tap.delegate="onTap(${i})" class="modal-button">${btText}</ui-button>`);
        });
        
        template =
        `<div class="au-animate modal modal-overlay"> 
            <div class="vbox modal-alert">
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

        this.remove = this.compiler.compile(template, this);

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
        let i, o, e;

        if (this.remove){
            ModalService.removeCaptureCancel(this.cancelHandle);

            this.remove();
            
            e = this.events['hide'];
            this.events['hide'] = null;

            if (e){
                o = {};

                for (i in this.data){
                    o[i] = this.data[i];
                }

                this.data = {};
                
                e.fn(index, o);
            }
        }
    }
}
