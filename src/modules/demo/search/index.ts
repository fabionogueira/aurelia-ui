export class DemoSearch{
    private cars:string[];
    private origialCars:string[];
    search='';

    constructor(){
        this.cars = this.origialCars = ['Honda', 'Lexus', 'Mazda', 'Nissan', 'Toyota', 'Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Volvo', 'Cadillac', 'Chrysler', 'Dodge', 'Ford'];
    }

    onChange(event){
        this.cars = this.origialCars.filter((item) => {
            return item.toLowerCase().search(event.value.toLowerCase())==-1 ? false : true;
        });

    }
}