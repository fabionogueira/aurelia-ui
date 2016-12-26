import {FrameworkConfiguration} from 'aurelia-framework';

export function configure(config: FrameworkConfiguration, configure:Function) {
  config.globalResources([
    './code'
  ]);
}
