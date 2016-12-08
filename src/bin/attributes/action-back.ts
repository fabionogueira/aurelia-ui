import {Action} from '../core/index';
import {AUI} from '../core/index';

Action.register('back', 'tap', ()=>{
    history.back();
});

AUI.setPressedState('[action-back]');