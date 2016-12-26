export class View1{
    constructor(private text='View 01'){}

    setRouterParam(name, param){
        console.log(name, param);
    }

    btCloseTap(){
        history.back();
    }
}
