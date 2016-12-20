export function UIElementInit(instance:any, element:Element) {
    instance.isUIElement = element['isUIElement'] = true;
    element.setAttribute('ui-element', '');
}
