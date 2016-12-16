import {FrameworkConfiguration} from 'aurelia-framework';

export function configure(config: FrameworkConfiguration, configure:Function) {
  let options = {
    theme: "android"
  }

  configure(options);

  config.globalResources([
    './elements/icon',

    './elements/modal-view',

    './elements/ui-accordion',
    './elements/ui-button',
    './elements/ui-checkbox',
    './elements/ui-drawer',
    './elements/ui-radio',
    './elements/ui-slider',
    './elements/ui-switch',
    './elements/ui-textfield',

    './attributes/action-back',
    './attributes/action-target',
    './attributes/action-highlight',

    `./less/themes/${options.theme}/index.css`
  ]);
  
}