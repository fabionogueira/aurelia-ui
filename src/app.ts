import {inject} from 'aurelia-framework';
import {UIAlert} from './aurelia-ui/core/ui-alert';
import {ModalService} from './aurelia-ui/core/modal-service';

declare var hljs:any;

@inject(ModalService, UIAlert)
export class App {
  router:any;
  roters_css;
  roters_element;
  roters_demo;

  constructor(private modalService:ModalService, private alert:UIAlert) {}

  onGitHubTap(){
    //require plugin org.apache.cordova.inappbrowser
    window.open("https://github.com/fabionogueira/aurelia-ui", "_system");
  }

  onViewCodeTap(path, id){
    /*let e = document.getElementById(id);
      if (e){
        console.log(e.innerHTML);
    }*/
    path = `text!${path}.html`;
    
    this.loadTemplate(path).then((html:string)=>{
      let container, nid, e;

      nid =  id+'-inner';

      //define o container;
      container = document.getElementById('template-container') || document.body.appendChild(document.createElement('div'));
      container.setAttribute('style', 'display:none');
      container.setAttribute('id', 'template-container');

      try{
        //adiciona o html no container
        container.innerHTML = html.replace('"'+id+'"', '"'+nid+'"');
        
        //obtém o elemento alvo
        e = container.firstChild.content.getElementById(nid);

        //aplica o highlight
        html = e.innerHTML.replace(/\</g,'&lt;').replace(/\>/g,'&gt;').replace(/\t/g,'*');
        container.innerHTML = `<pre><code class="html">${html}</code></pre>`;
        hljs.highlightBlock(container.firstChild);
        html = container.innerHTML;
      }catch(_e){
        html = '';
      }

      //limpa o container
      container.innerHTML = '';

      ModalService.show('source', html);
    });

  }

  loadTemplate(url){
    return new Promise((resolve, reject) => {
      window['require']([url], resolve, reject);
    });
  }

  configureRouter(config, router) {
    let a: any[]= [{ route: ['', 'home'], name: 'home', moduleId: 'modules/home/index' }];

    this.roters_css     = ['ui-card', 'breadcrumb'],
    this.roters_element = ['ui-button','ui-checkbox','ui-drawer','ui-radio','ui-slider','ui-textfield'],
    this.roters_demo    = ['form','checkbox','modals','search'];

    this.router = router;
    this.modalService.configure(config);
    
    this.roters_css.forEach    (item=>{a.push({route:item, name:item, moduleId:`modules/css/${item}/index`, nav:true});});
    this.roters_element.forEach(item=>{a.push({route:item, name:item, moduleId:`modules/element/${item}/index`, nav:true});});
    this.roters_demo.forEach   (item=>{a.push({route:item, name:item, moduleId:`modules/demo/${item}/index`, nav:true});});

    a = a.concat([
        { route: 'modal/view1',  name: 'view1',  moduleId: 'modules/demo/modals/view1', nav: true },
        { route: 'modal/view2',  name: 'view2',  moduleId: 'modules/demo/modals/view2', nav: true },
        { route: 'modal/source', name: 'source', moduleId: 'modules/demo/modals/source',nav: true }
    ]);

    config.title = 'Aurelia UI';
    config.map(a);
  }
}
