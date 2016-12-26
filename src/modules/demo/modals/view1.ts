export class View1{
    constructor(private text='View 01'){}

    btPopupTap(){
        location.hash='#/modal/view2';
    }

    btDoneTap(){
        history.back();
    }
}
