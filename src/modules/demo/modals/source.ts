export class Source{
    sourceElement:HTMLElement;

    constructor(private source=''){}

    setRouterParam(name, code){
        this.source = code;
    }

    btCloseTap(){
        history.back();
    }
}
