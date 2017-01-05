export function UIElementInit(instance:any, element:Element | HTMLElement) {
    instance.isUIElement = element['isUIElement'] = true;
    
    //deprecated
    element.setAttribute('ui-element', '');

    element.setAttribute('tabindex', '1');

    element.addEventListener('focus', function(event){
        let vm = this.au.controller.viewModel;
        if (vm.beforeFocus){
            vm.beforeFocus(event)
        }
    });
    element.addEventListener('blur', function(event){
        let vm = this.au.controller.viewModel;
        if (vm.beforeBlur){
            vm.beforeBlur(event)
        }
    });
}
