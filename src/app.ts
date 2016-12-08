import {inject} from 'aurelia-framework';
import {ModalService} from './bin/core/modal-service';

@inject(ModalService)
export class App {
  router:any;

  constructor(private modalService:ModalService) {}

  onTap(event){
    //console.log(event)
  }

  configureRouter(config, router) {
    this.router = router;
    this.modalService.configure(config);

    config.title = 'Aurelia';
    config.map([
      { route: ['', 'home'], name: 'home',     moduleId: 'modules/home/index' },
      { route: 'buttons',    name: 'buttons',  moduleId: 'modules/buttons/index',  nav: true },
      { route: 'form',       name: 'form',     moduleId: 'modules/form/index',     nav: true },
      { route: 'checkbox',   name: 'checkbox', moduleId: 'modules/checkbox/index', nav: true },
      { route: 'modals',     name: 'modals',   moduleId: 'modules/modals/index',   nav: true }
    ]);
  }
}
