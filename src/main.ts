import {Aurelia} from 'aurelia-framework'
import environment from './environment';

//Configure Bluebird Promises.
//Note: You may want to use environment-specific configuration.
(<any>Promise).config({
  warnings: {
    wForgottenReturn: false
  }
});

export function configure(aurelia: Aurelia) {
  let theme = 'android';

  aurelia.use
    .standardConfiguration()
    .feature('aurelia-ui', (options)=>{
      options.theme  = theme;
      options.styles = `app-styles/${theme}.css`;
    })
    .feature('./attributes');

  aurelia.use.plugin('aurelia-animator-css');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
