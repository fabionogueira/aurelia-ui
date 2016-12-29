import {bindable} from 'aurelia-framework';

export class DemoSearch{
    private cars:string[];
    private origialCars:string[];
    
    @bindable search='';

    constructor(){
        this.cars = this.origialCars = ['Honda', 'Lexus', 'Mazda', 'Nissan', 'Toyota', 'Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Volvo', 'Cadillac', 'Chrysler', 'Dodge', 'Ford'];
    }

    searchChanged(value){
        this.cars = this.origialCars.filter((item) => {
            return item.toLowerCase().search(value.toLowerCase())==-1 ? false : true;
        });
    }
}