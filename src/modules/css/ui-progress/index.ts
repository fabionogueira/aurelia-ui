export class ViewUIProgress{
    percent=0;
    percent1=0;

    constructor(){
        let p = this.percent;
        let fn = ()=>{
            this.percent+=1;
            if (this.percent<100){
                setTimeout(fn,200);        
            }
        };

        setTimeout(fn,2000);
    }

    setPercent(percent){
        this.percent1 = percent;
    }
}