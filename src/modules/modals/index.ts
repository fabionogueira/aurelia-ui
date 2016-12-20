import {inject} from 'aurelia-framework';
import {UIAlert} from '../../aurelia-ui/core/ui-alert';

@inject(UIAlert)
export class Modals{
    constructor(private alert:UIAlert){}

    buttonAlertTap(){
        this.alert.show('Simple alert show', 'Aurelia UI');
    }

    buttonConfirmTap(){
        this.alert.show('Are you feel good today?', 'Aurelia UI', ['Cancelar', '<b>OK</b>'])
            .on('hide',(index)=>{
                console.log(index);
            });
    }

    buttonPromptTap(){
        let template = '<ui-textfield value.bind="data.name" placeholder="What is your name"></ui-textfield>';
        this.alert.show('What is your name?', 'Aurelia UI', ['Cancelar', '<b>OK</b>'], template)
            .on('hide', (index, data)=>{
                console.log(index, data);
            });
    }

    buttonLoginTap(){
        let template = 
            `<ui-textfield class="floating" value.bind="data.username" placeholder="Username"></ui-textfield>
             <ui-textfield class="floating" value.bind="data.password" placeholder="Password" type="password"></ui-textfield>`;

        this.alert.show('Enter your username and password', 'Aurelia UI', ['CANCEL', '<b>OK</b>'], template)
            .on('hide', (index, data)=>{
                let s = `<p>Username=<b>${data.username}</b></p>
                         <p>Password=<b>${data.password}</b></p>`;
                
                if (index==1) this.alert.show(s, 'Aurelia UI');
            });
    }

    buttonPasswordTap(){
        let template = '<ui-textfield value.bind="data.password" placeholder="Password" type="password"></ui-textfield>';
        this.alert.show('Enter your password', 'Aurelia UI', ['Cancelar', '<b>OK</b>'], template)
            .on('hide', (index, data)=>{
                console.log(index, data);
            });
    }

    buttonModalView(){
        location.hash = '#/modal/view1';
    }
}