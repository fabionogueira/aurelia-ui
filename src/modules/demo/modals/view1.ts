import {UIAlert} from '../../../aurelia-ui/core/ui-alert';
import {inject} from 'aurelia-framework';

@inject(UIAlert)
export class View1{
    constructor(private uiAlert:UIAlert, private text='View 01'){
        console.log(this.uiAlert);
    }

    btPopupTap(){
        location.hash='#/modal/view2';
    }

    btAlertTap(){
        this.uiAlert.show('UIAlert Show');
    }

    btDoneTap(){
        history.back();
    }
}
