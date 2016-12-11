import {FrameworkConfiguration} from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    './elements/icon',

    './elements/modal-view',

    './elements/ui-accordion',
    './elements/ui-button',
    './elements/ui-checkbox',
    './elements/ui-radio',
    './elements/ui-slider',
    './elements/ui-switch',
    './elements/ui-textfield',

    './attributes/action-back',
    './attributes/action-target',
    './attributes/action-highlight',

    './index.css'
  ]);
  
}