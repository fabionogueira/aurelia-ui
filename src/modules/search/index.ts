export class Home{
    userAgent: string
    constructor(){
        let s = navigator.userAgent;
        this.userAgent = s;
    }
}