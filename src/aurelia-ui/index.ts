import {FrameworkConfiguration} from 'aurelia-framework';
import {AUI} from './core/index';

export function configure(config: FrameworkConfiguration, configure:Function) {
  let arr:string[], options = {
    theme : "android",
    styles: null
  };

  configure(options);

  AUI.THEME = options.theme;

  arr = [
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

    './actions/action-back',
    './actions/action-target',
    './actions/action-highlight',

    `./themes/${options.theme}/index.css`
  ];

  if (options.styles){
    Array.isArray(options.styles) ? arr.concat(options.styles) : arr.push(options.styles);
  }

  config.globalResources(arr);
}
