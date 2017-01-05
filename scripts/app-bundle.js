var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/core/compiler',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var Compiler = (function () {
        function Compiler(viewCompiler) {
            this.viewCompiler = viewCompiler;
        }
        Compiler.prototype.compile = function (html, viewModel, complete) {
            var template = "<template>" + html + "</template>";
            var viewFactory = this.viewCompiler.compile(template);
            var viewSlot = new aurelia_framework_1.ViewSlot(document.body, true);
            var container = new aurelia_framework_1.Container();
            var view = viewFactory.create(container);
            viewModel = viewModel || {};
            view.bind(viewModel);
            viewSlot.attached();
            viewSlot.add(view);
            if (complete) {
                complete(view);
            }
            return function () {
                viewSlot.remove(view);
            };
        };
        return Compiler;
    }());
    Compiler = __decorate([
        aurelia_framework_1.inject(aurelia_framework_1.ViewCompiler),
        aurelia_framework_1.processContent(false),
        aurelia_framework_1.noView,
        __metadata("design:paramtypes", [aurelia_framework_1.ViewCompiler])
    ], Compiler);
    exports.Compiler = Compiler;
});

define('aurelia-ui/core/device',["require", "exports"], function (require, exports) {
    "use strict";
    var device;
    var ua = navigator.userAgent;
    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
    device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;
    if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
    }
    if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
    }
    if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
    }
    if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
    }
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
            device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
    }
    device.webView = Boolean((iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i));
    var windowWidth = document.body.clientWidth;
    var windowHeight = 20;
    device.statusBar = false;
    if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
        device.statusBar = true;
    }
    else {
        device.statusBar = false;
    }
    var classNames = [];
    device.pixelRatio = window.devicePixelRatio || 1;
    classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
    if (device.pixelRatio >= 2) {
        classNames.push('retina');
    }
    if (device.os) {
        classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
        if (device.os === 'ios') {
            var i = void 0, major = parseInt(device.osVersion.split('.')[0], 10);
            for (i = major - 1; i >= 6; i--) {
                classNames.push('ios-gt-' + i);
            }
        }
    }
    if (classNames.length > 0)
        document.body.classList.add(classNames.join(' '));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = device;
});

define('aurelia-ui/core/support',["require", "exports"], function (require, exports) {
    "use strict";
    var support = {
        touch: !!(('ontouchstart' in window) || window['DocumentTouch'] && document instanceof window['DocumentTouch'])
    };
    document.body.classList.add(support.touch ? 'is-touch' : 'is-desktop');
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = support;
});

define('aurelia-ui/core/dispatcher',["require", "exports", "./support", "./index"], function (require, exports, support_1, index_1) {
    "use strict";
    var dispatcherId = 0;
    ;
    var GLOBAL_OBSERVERS = {};
    var HAMMER = new Hammer(document.body);
    var OLD_ACTIVE_ELEMENT = { element: null, parents: [] };
    var MD_TARGET;
    var EVENTS_TRANSLATE = {
        tap: 'tap',
        press: 'longpress',
        panleft: 'panleft',
        panright: 'panright'
    };
    var dispatcher = {
        emit: function (eventName, event, element) {
            var g, controller, fn, customEvent;
            dispatcherId++;
            event = event || {};
            event.$target = element || getTargetElement(event) || element;
            registerDispatcherId(event, eventName, event.$target, dispatcherId);
            customEvent = createEvent(eventName, event);
            registerDispatcherId(customEvent, eventName, event.$target, dispatcherId);
            if (element) {
                controller = element['au'].controller;
                if (controller) {
                    fn = controller.viewModel['on' + eventName[0].toUpperCase() + eventName.substring(1)];
                    if (fn) {
                        fn.call(controller.viewModel, event);
                    }
                }
            }
            g = GLOBAL_OBSERVERS[eventName];
            if (g) {
                g.forEach(function (fn) {
                    fn(customEvent);
                });
            }
            event._dispatcher = customEvent._dispatcher = true;
            if (event.$target)
                event.$target.dispatchEvent(customEvent);
        },
        delegate: function (eventName, event, element) {
            var g, customEvent;
            event = event || {};
            customEvent = createEvent(eventName, event);
            g = GLOBAL_OBSERVERS[eventName];
            if (g) {
                g.forEach(function (fn) {
                    fn(customEvent);
                });
            }
            customEvent._dispatcher = true;
            element.dispatchEvent(customEvent);
        },
        on: function (eventName, fn) {
            if (!GLOBAL_OBSERVERS[eventName]) {
                GLOBAL_OBSERVERS[eventName] = [];
            }
            fn['$event_' + eventName] = true;
            GLOBAL_OBSERVERS[eventName].push(fn);
        },
        off: function (eventName, fn) {
            var i, fns, off = fn['$event_' + eventName];
            if (off) {
                delete (fn['$event_' + eventName]);
                fns = GLOBAL_OBSERVERS[off.eventName];
                for (i = 0; i < fns.length; i++) {
                    if (fns[i] === fn) {
                        fns.a.splice(i, 1);
                        break;
                    }
                }
            }
        },
        updateActiveElement: updateActiveElement
    };
    function registerDispatcherId(event, name, element, id) {
        event._dispatcherId = id;
        if (element) {
            element._dispatchers = element._dispatchers || {};
            element._dispatchers[name] = id;
        }
    }
    function updateActiveElement() {
        setTimeout(function () {
            var a = [], element = document.activeElement;
            if (OLD_ACTIVE_ELEMENT.element) {
                OLD_ACTIVE_ELEMENT.element.setAttribute('ui-element', '');
                OLD_ACTIVE_ELEMENT.parents.forEach(function (e) {
                    e.setAttribute('set-active', '');
                });
            }
            OLD_ACTIVE_ELEMENT.parents = [];
            OLD_ACTIVE_ELEMENT.element = null;
            while (element !== document.body) {
                if (element.getAttribute('set-active') != null) {
                    a.push(element);
                }
                if (element.getAttribute('ui-element') != null) {
                    OLD_ACTIVE_ELEMENT.element = element;
                    OLD_ACTIVE_ELEMENT.parents = a;
                }
                element = element.parentElement;
            }
            if (OLD_ACTIVE_ELEMENT.element) {
                OLD_ACTIVE_ELEMENT.element.setAttribute('ui-element', 'active');
                OLD_ACTIVE_ELEMENT.parents.forEach(function (e) {
                    e.setAttribute('set-active', 'yes');
                });
            }
        }, 10);
        return null;
    }
    function createEvent(name, options) {
        var i, d, customEvent;
        if (window['customEvent']) {
            customEvent = new CustomEvent(name, { bubbles: true });
        }
        else {
            customEvent = document.createEvent("CustomEvent");
            customEvent.initCustomEvent(name, true, true, {});
        }
        for (i in options) {
            if (customEvent[i] === undefined) {
                customEvent[i] = options[i];
                continue;
            }
            if (customEvent[i] === null) {
                d = Object.getOwnPropertyDescriptor(customEvent, i);
                if (d && d.writable) {
                    customEvent[i] = options[i];
                }
            }
        }
        return customEvent;
    }
    function eventsHandle(event) {
        var e, actions;
        if (event._dispatcher)
            return;
        e = EVENTS_TRANSLATE[event.type];
        updateActiveElement();
        if (!event._dispatcher) {
            dispatcher.emit(event.type, event, index_1.AUI.getUIRoot(getTargetElement(event)));
            index_1.Action.findElement(event.target).forEach(function (action) {
                if (action.events == '*' || action.events.search(event.type) >= 0) {
                    index_1.Action.do(action.attribute, event.type, action.value, action.element, event);
                }
            });
        }
        event._dispatcher = true;
    }
    function getTargetElement(event) {
        return event.toElement || event.srcElement || event.target || event.touches && event.touches[0].target;
    }
    HAMMER.on("panleft panright tap press", eventsHandle);
    document.addEventListener('keydown', function (event) { return (event.keyCode == 9) ? updateActiveElement() : null; });
    window.addEventListener('blur', updateActiveElement);
    document.addEventListener(support_1.default.touch ? 'touchstart' : 'mousedown', function (event) {
        MD_TARGET = event.target;
        eventsHandle(event);
    });
    document.addEventListener(support_1.default.touch ? 'touchend' : 'mouseup', function (event) {
        if (MD_TARGET) {
            MD_TARGET = null;
            eventsHandle(event);
        }
    });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = dispatcher;
});

define('aurelia-ui/core/index',["require", "exports", "./dispatcher"], function (require, exports, dispatcher_1) {
    "use strict";
    var Action_REGISTERED = {};
    var DOMSelector_CACHE = {};
    var setPressedState_REGISTERED = {};
    var setPressedState_ACTIVE;
    var setPressedState_TM;
    var Action = (function () {
        function Action() {
        }
        Action.register = function (name, events, fn) {
            Action_REGISTERED['action-' + name] = {
                events: events,
                do: fn
            };
            return Action;
        };
        Action.do = function (name) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var a = Action_REGISTERED[name];
            if (a) {
                a.do.apply(null, params);
            }
        };
        Action.findElement = function (element) {
            var i, a = [], attr, attrs;
            while (element && element !== document.body) {
                for (attr in Action_REGISTERED) {
                    if (element.hasAttribute(attr)) {
                        attrs = element.attributes;
                        for (i = 0; i < attrs.length; i++) {
                            attr = attrs[i].name;
                            if (Action_REGISTERED[attr]) {
                                a.push({
                                    element: element,
                                    attribute: attr,
                                    value: element.getAttribute(attr),
                                    events: Action_REGISTERED[attr].events
                                });
                            }
                        }
                        return a;
                    }
                }
                element = element.parentElement;
            }
            return a;
        };
        return Action;
    }());
    exports.Action = Action;
    var AUI = (function () {
        function AUI() {
        }
        AUI.setPressedState = function (selector) {
            setPressedState_REGISTERED[selector] = selector;
        };
        AUI.getUIRoot = function (element) {
            while (element && element !== document.body) {
                if (element['isUIElement']) {
                    return element;
                }
                element = element.parentElement;
            }
            return null;
        };
        AUI.getTransitionDuration = function (element) {
            var d = getComputedStyle(element.children[1]).transitionDuration;
            return d.indexOf('ms') > 0 ? Number(d.replace('ms', '')) : Number(d.replace('s', '')) * 1000;
        };
        return AUI;
    }());
    exports.AUI = AUI;
    var DOMSelector = (function () {
        function DOMSelector() {
        }
        return DOMSelector;
    }());
    DOMSelector.check = function (element, oSelector) {
        return oSelector.fn(element, oSelector.v1, oSelector.v2);
    };
    DOMSelector.closet = function (element, selector) {
        var oSelector = DOMSelector.init(selector);
        while (element && element.getAttribute) {
            if (DOMSelector.check(element, oSelector))
                return element;
            element = element.parentNode;
        }
        return null;
    };
    DOMSelector.find = function (element, selector) {
        var i, c, e, oSelector = DOMSelector.init(selector);
        for (i = 0; i < element.children.length; i++) {
            c = element.children[i];
            if (DOMSelector.check(c, oSelector)) {
                return c;
            }
            e = DOMSelector.find(c, selector);
            if (e) {
                return e;
            }
        }
        return null;
    };
    DOMSelector.init = function (selector) {
        var fn, a, c, v1, v2;
        if (DOMSelector_CACHE[selector]) {
            return DOMSelector_CACHE[selector];
        }
        c = selector.substr(0, 1);
        if (c === '#') {
            fn = DOMSelector.checkById;
            v1 = selector.substr(1);
        }
        else if (c === '[') {
            fn = DOMSelector.checkByAttribute;
            a = selector.substr(1, selector.length - 2).split('=');
            v1 = a[0];
            v2 = a[1];
        }
        else if (c === '.') {
            fn = DOMSelector.checkByClass;
            v1 = selector.substr(1);
        }
        else {
            fn = DOMSelector.checkByElementName;
            v1 = selector;
        }
        DOMSelector_CACHE[selector] = {
            fn: fn,
            v1: v1,
            v2: v2
        };
        return DOMSelector_CACHE[selector];
    };
    DOMSelector.checkById = function (element, v1) {
        return element.getAttribute('id') === v1;
    };
    DOMSelector.checkByAttribute = function (element, v1, v2) {
        var r = element.hasAttribute(v1);
        if (r) {
            return v2 ? (element.getAttribute(v1) === v2) : true;
        }
        return false;
    };
    DOMSelector.checkByClass = function (element, v1) {
        return element.className && element.className.indexOf ? element.className.indexOf(v1) > -1 : false;
    };
    DOMSelector.checkByElementName = function (element, v1) {
        return element.localName === v1;
    };
    exports.DOMSelector = DOMSelector;
    ;
    ['touchstart', 'mousedown'].forEach(function (eventName) {
        dispatcher_1.default.on(eventName, function (event) {
            var selector, oSelector, element = event.$target;
            while (element && element.getAttribute) {
                for (selector in setPressedState_REGISTERED) {
                    oSelector = DOMSelector.init(selector);
                    if (DOMSelector.check(element, oSelector)) {
                        return setDown(element);
                    }
                }
                element = element.parentNode;
            }
        });
    });
    ['tap', 'touchend', 'mouseup'].forEach(function (event) {
        dispatcher_1.default.on(event, function (e) {
            if (setPressedState_ACTIVE) {
                setUp(setPressedState_ACTIVE);
            }
        });
    });
    window.addEventListener("hashchange", function (event) {
        var s1 = event.oldURL.split('#/')[1] || '';
        var s2 = event.newURL.split('#/')[1] || '';
        var s3;
        s1 = (s1.replace(/\//g, '_') || 'main');
        s2 = (s2.replace(/\//g, '_') || 'main');
        s3 = s1 + '-' + s2;
        document.body.classList.remove(document.body['hashcls']);
        document.body.classList.add(s3);
        document.body['hashcls'] = s3;
    }, false);
    function setDown(element) {
        if (element == setPressedState_ACTIVE) {
            cancelDown();
        }
        setPressedState_ACTIVE = element;
        element.setAttribute('is-pressed', '');
    }
    function setUp(element) {
        setPressedState_TM = setTimeout(function () {
            element.removeAttribute('is-pressed');
        }, 100);
    }
    function cancelDown() {
        clearTimeout(setPressedState_TM);
    }
    AUI.setPressedState('.list-item');
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/core/modal-service',["require", "exports", "aurelia-framework", "aurelia-router", "./index"], function (require, exports, aurelia_framework_1, aurelia_router_1, index_1) {
    "use strict";
    var routerIsCanceled = false;
    var containerHTMLElement;
    var modalParams = {};
    var routerInstance;
    var registeredCaptureCancel = [];
    var modalIndex = -1;
    var mouseUpTarget;
    var previousRoute;
    if (!location.hash) {
        location.hash = '#/';
    }
    var ModalService = ModalService_1 = (function () {
        function ModalService(router) {
            routerInstance = router;
        }
        ModalService.setRouterParam = function (routerName, param) {
            modalParams[routerName] = param;
            return ModalService_1;
        };
        ModalService.show = function (routerName, param) {
            var r = getRouterByName(routerName);
            if (r) {
                if (param) {
                    ModalService_1.setRouterParam(routerName, param);
                }
                location.hash = '#/' + r.route;
            }
        };
        ModalService.hide = function (routerName) {
            var r = getRouterByName(routerName);
            if (r && "#/" + r.route == location.hash) {
                history.back();
            }
        };
        ModalService.captureCancel = function (fn, context) {
            ModalService_1.addCaptureCancel(fn, context);
        };
        ModalService.addCaptureCancel = function (fn, context) {
            if (!fn.registeredCapture) {
                fn.context = context;
                fn.registeredCapture = true;
                registeredCaptureCancel.push(fn);
            }
        };
        ModalService.removeCaptureCancel = function (fn) {
            var i;
            for (i = 0; i < registeredCaptureCancel.length; i++) {
                if (registeredCaptureCancel[i] === fn) {
                    fn.context = null;
                    fn.registeredCapture = null;
                    return registeredCaptureCancel.splice(i, 1);
                }
            }
        };
        ModalService.prototype.configure = function (config) {
            var modalStep = new ModalStep(this);
            config.addPipelineStep('authorize', modalStep);
        };
        return ModalService;
    }());
    ModalService = ModalService_1 = __decorate([
        aurelia_framework_1.inject(aurelia_router_1.Router),
        __metadata("design:paramtypes", [Object])
    ], ModalService);
    exports.ModalService = ModalService;
    var ModalStep = (function () {
        function ModalStep(modalService) {
            this.modalService = modalService;
        }
        ModalStep.prototype.run = function (routingContext, next) {
            if (!previousRoute) {
                previousRoute = 1;
                if ((routingContext.config.route.substring(0, 6) == 'modal/')) {
                    return next.cancel(new aurelia_router_1.Redirect('/'));
                }
            }
            if (processRegisteredCancel('back') || routerIsCanceled) {
                return next.cancel();
            }
            if (routingContext.config.route.substring(0, 6) == 'modal/') {
                var url = void 0, viewModelInstance = void 0, param = void 0, viewPortInstructions = void 0, el = document.querySelector('modal-view');
                if (el) {
                    viewPortInstructions = routingContext.viewPortInstructions.default;
                    viewModelInstance = viewPortInstructions.component.viewModel;
                    param = modalParams[routingContext.config.name];
                    url = routingContext.config.moduleId + '.html';
                    modalIndex++;
                    if (viewModelInstance.setRouterParam && param) {
                        viewModelInstance.setRouterParam(routingContext.config.name, param);
                    }
                    el.au.controller.viewModel.loadView(modalIndex, url, viewModelInstance);
                }
                routerIsCanceled = true;
                return next.cancel();
            }
            return next();
        };
        return ModalStep;
    }());
    window.addEventListener('popstate', function (event) {
        var isModalOpennig = location.hash.substring(0, 8) === '#/modal/';
        if (!location.hash) {
            processRegisteredCancel('back');
            return location.hash = '#/';
        }
        if (!processRegisteredCancel('back')) {
            if (!routerIsCanceled && !isModalOpennig && modalIndex > -1) {
                var url = void 0, viewModel = void 0, canUnload = true, el = document.querySelector('modal-view');
                if (el) {
                    viewModel = el.au.controller.viewModel["viewModel" + el._viewStrategyIndex];
                    if (viewModel && viewModel.canModalHide && viewModel.canModalHide() === false) {
                        return routerIsCanceled = true;
                    }
                    el.au.controller.viewModel.unloadView(modalIndex--);
                }
            }
        }
        routerIsCanceled = false;
    });
    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 27) {
            processRegisteredCancel('key');
        }
    });
    document.addEventListener('mousedown', function (event) {
        mouseUpTarget = null;
    });
    document.addEventListener('mouseup', function (event) {
        mouseUpTarget = index_1.AUI.getUIRoot(event.target);
        setTimeout(function () { mouseUpTarget = null; }, 100);
    });
    function processRegisteredCancel(origin) {
        var i, e, cancel = false, a = registeredCaptureCancel;
        registeredCaptureCancel = [];
        a.forEach(function (fn) {
            e = {
                "origin": origin,
                "cancel": false,
                "target": mouseUpTarget
            };
            fn.apply(fn.context, [e]);
            fn.context = null;
            fn.registeredCapture = null;
            if (e.cancel) {
                cancel = true;
            }
        });
        mouseUpTarget = null;
        return cancel;
    }
    function getRouterByName(routerName) {
        var i, r = routerInstance.routes;
        for (i = 0; i < r.length; i++) {
            if (r[i].name == routerName) {
                return r[i];
            }
        }
        return null;
    }
    var ModalService_1;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/core/ui-alert',["require", "exports", "aurelia-framework", "./compiler", "./modal-service"], function (require, exports, aurelia_framework_1, compiler_1, modal_service_1) {
    "use strict";
    var oldActiveFocus;
    var UIAlert = (function () {
        function UIAlert(compiler, remove) {
            this.compiler = compiler;
            this.remove = remove;
            this.events = {};
            this.context = {
                UIAlert: this,
                onTap: null,
                data: null
            };
        }
        UIAlert.prototype.show = function (text, title, buttons, html) {
            var _this = this;
            if (title === void 0) { title = ''; }
            if (buttons === void 0) { buttons = ['OK']; }
            if (html === void 0) { html = ''; }
            var buttonsStr = '', template;
            buttons.forEach(function (btText, i) {
                buttonsStr += ("<ui-button tap.delegate=\"onTap(" + i + ")\" class=\"modal-button\">" + btText + "</ui-button>");
            });
            template =
                "<div class=\"au-animate modal modal-overlay\"> \n            <div class=\"vbox modal-alert\" tabindex=\"1\" style=\"outline:none;\">\n                <div class=\"vbox\">" +
                    (title ? ("<div class=\"modal-alert-title\">" + title + "</div>") : '') +
                    ("<div class=\"modal-alert-text\">" + text + "</div>") +
                    (html ? ("<div class=\"modal-alert-content\">" + html + "</div>") : '') +
                    '</div>' +
                    ("<div class=\"hbox modal-alert-buttons\">\n                    " + buttonsStr + "\n                </div>\n            </div>\n        </div>");
            this.context.UIAlert = this;
            this.context.onTap = function (index) { _this.context.UIAlert.hide(index); };
            this.context.data = {};
            oldActiveFocus = document.activeElement;
            this.remove = this.compiler.compile(template, this.context, function (viewElement) {
                viewElement.firstChild.children[0].focus();
            });
            modal_service_1.ModalService.captureCancel(this.cancelHandle, this);
            return {
                on: function (evt, fn) {
                    _this.events[evt] = {
                        fn: fn
                    };
                }
            };
        };
        UIAlert.prototype.cancelHandle = function (event) {
            event.cancel = true;
            this.hide(event.origin == 'key' ? 27 : -1);
        };
        UIAlert.prototype.hide = function (index) {
            var o, e;
            if (this.remove) {
                modal_service_1.ModalService.removeCaptureCancel(this.cancelHandle);
                this.remove();
                delete (this.context.UIAlert);
                delete (this.context.onTap);
                e = this.events['hide'];
                this.events['hide'] = null;
                if (e) {
                    o = JSON.parse(JSON.stringify(this.context.data));
                    e.fn(index, o);
                }
                if (oldActiveFocus) {
                    oldActiveFocus.focus();
                }
                oldActiveFocus = null;
            }
        };
        return UIAlert;
    }());
    UIAlert = __decorate([
        aurelia_framework_1.noView,
        aurelia_framework_1.inject(compiler_1.Compiler),
        __metadata("design:paramtypes", [compiler_1.Compiler, Object])
    ], UIAlert);
    exports.UIAlert = UIAlert;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('app',["require", "exports", "aurelia-framework", "./aurelia-ui/core/ui-alert", "./aurelia-ui/core/modal-service"], function (require, exports, aurelia_framework_1, ui_alert_1, modal_service_1) {
    "use strict";
    var App = (function () {
        function App(modalService, alert) {
            this.modalService = modalService;
            this.alert = alert;
        }
        App.prototype.onGitHubTap = function () {
            window.open("https://github.com/fabionogueira/aurelia-ui", "_system");
        };
        App.prototype.onViewCodeTap = function (path, id) {
            path = "text!" + path + ".html";
            this.loadTemplate(path).then(function (html) {
                var container, nid, e;
                nid = id + '-inner';
                container = document.getElementById('template-container') || document.body.appendChild(document.createElement('div'));
                container.setAttribute('style', 'display:none');
                container.setAttribute('id', 'template-container');
                try {
                    container.innerHTML = html.replace('"' + id + '"', '"' + nid + '"');
                    e = container.firstChild.content.getElementById(nid);
                    html = e.innerHTML
                        .replace(/  /g, '*')
                        .replace(/\</g, '&lt;')
                        .replace(/\>/g, '&gt;');
                    var a = html.match(/\**&lt;/);
                    if (a) {
                        var s_1 = a[0].replace('&lt;', '').replace(/\*/g, '\\*');
                        var r_1 = new RegExp(s_1);
                        s_1 = '';
                        html.split('\n').forEach(function (row) {
                            s_1 += (row.replace(r_1, '').replace(/\*/g, ' ') + '\n');
                        });
                        html = s_1;
                    }
                    container.innerHTML = "<pre><code class=\"html\" style=\"-webkit-user-select:all;\">" + html + "</code></pre>";
                    hljs.highlightBlock(container.firstChild);
                    html = container.innerHTML;
                }
                catch (_e) {
                    html = '';
                }
                container.innerHTML = '';
                modal_service_1.ModalService.show('source', html);
            });
        };
        App.prototype.loadTemplate = function (url) {
            return new Promise(function (resolve, reject) {
                window['require']([url], resolve, reject);
            });
        };
        App.prototype.configureRouter = function (config, router) {
            var a = [{ route: ['', 'home'], name: 'home', moduleId: 'modules/home/index' }];
            this.roters_css = ['ui-card', 'ui-list', 'ui-breadcrumb'],
                this.roters_element = ['ui-button', 'ui-checkbox', 'ui-radio', 'ui-slider', 'ui-textfield', 'ui-progress', 'ui-drawer'],
                this.roters_demo = ['form', 'modals', 'search'];
            this.router = router;
            this.modalService.configure(config);
            this.roters_css.forEach(function (item) { a.push({ route: item, name: item, moduleId: "modules/css/" + item + "/index", nav: true }); });
            this.roters_element.forEach(function (item) { a.push({ route: item, name: item, moduleId: "modules/element/" + item + "/index", nav: true }); });
            this.roters_demo.forEach(function (item) { a.push({ route: item, name: item, moduleId: "modules/demo/" + item + "/index", nav: true }); });
            a = a.concat([
                { route: 'modal/view1', name: 'view1', moduleId: 'modules/demo/modals/view1', nav: true },
                { route: 'modal/view2', name: 'view2', moduleId: 'modules/demo/modals/view2', nav: true },
                { route: 'modal/source', name: 'source', moduleId: 'modules/demo/modals/source', nav: true }
            ]);
            config.title = 'Aurelia UI';
            config.map(a);
        };
        return App;
    }());
    App = __decorate([
        aurelia_framework_1.inject(modal_service_1.ModalService, ui_alert_1.UIAlert),
        __metadata("design:paramtypes", [modal_service_1.ModalService, ui_alert_1.UIAlert])
    ], App);
    exports.App = App;
});

define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});

define('main',["require", "exports", "./environment"], function (require, exports, environment_1) {
    "use strict";
    Promise.config({
        warnings: {
            wForgottenReturn: false
        }
    });
    function configure(aurelia) {
        var theme = 'android';
        aurelia.use
            .standardConfiguration()
            .feature('aurelia-ui', function (options) {
            options.theme = theme;
            options.styles = "app-styles/" + theme + ".css";
        })
            .feature('./attributes');
        aurelia.use.plugin('aurelia-animator-css');
        if (environment_1.default.debug) {
            aurelia.use.developmentLogging();
        }
        if (environment_1.default.testing) {
            aurelia.use.plugin('aurelia-testing');
        }
        aurelia.start().then(function () { return aurelia.setRoot(); });
    }
    exports.configure = configure;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('attributes/code',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var Code = (function () {
        function Code(element) {
        }
        return Code;
    }());
    Code = __decorate([
        aurelia_framework_1.customAttribute('code'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], Code);
    exports.Code = Code;
});

define('attributes/index',["require", "exports"], function (require, exports) {
    "use strict";
    function configure(config, configure) {
        config.globalResources([
            './code'
        ]);
    }
    exports.configure = configure;
});

define('aurelia-ui/index',["require", "exports", "./core/index"], function (require, exports, index_1) {
    "use strict";
    function configure(config, configure) {
        var arr, options = {
            theme: "android",
            styles: null
        };
        configure(options);
        index_1.AUI.THEME = options.theme;
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
            './elements/ui-progress',
            './actions/action-back',
            './actions/action-target',
            './actions/action-highlight',
            "./themes/" + options.theme + "/_index.css"
        ];
        if (options.styles) {
            Array.isArray(options.styles) ? arr.concat(options.styles) : arr.push(options.styles);
        }
        config.globalResources(arr);
    }
    exports.configure = configure;
});

define('aurelia-ui/actions/action-back',["require", "exports", "../core/index", "../core/index"], function (require, exports, index_1, index_2) {
    "use strict";
    index_1.Action.register('back', 'tap', function () {
        history.back();
    });
    index_2.AUI.setPressedState('[action-back]');
});

define('aurelia-ui/actions/action-highlight',["require", "exports", "../core/index", "../core/dispatcher"], function (require, exports, index_1, dispatcher_1) {
    "use strict";
    var isPressedElement, tm;
    index_1.Action.register('highlight', 'mousedown mouseup', function (eventName, value, element, event) {
        var e;
        if (eventName === 'mousedown') {
            isPressedElement = element;
            element.setAttribute('is-pressed', 'yes');
        }
    });
    dispatcher_1.default.on('mouseup', function (event) {
        if (isPressedElement) {
            isPressedElement.setAttribute('is-pressed', 'no');
            isPressedElement = null;
        }
    });
});

define('aurelia-ui/actions/action-target',["require", "exports", "../core/index", "../core/index", "../core/dispatcher"], function (require, exports, index_1, index_2, dispatcher_1) {
    "use strict";
    index_1.Action.register('target', '*', function (eventName, selector, element, event) {
        var e;
        if (selector) {
            e = index_2.DOMSelector.find(element, selector);
            if (e) {
                if (event._dispatcherId && e._dispatchers && event._dispatcherId == e._dispatchers[eventName]) {
                    return;
                }
                dispatcher_1.default.emit(eventName, event, e);
            }
        }
    });
});

define('aurelia-ui/core/async-each',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = function (arrayOrObject) {
        if (!Array.isArray(arrayOrObject)) {
            return eachObj(arrayOrObject);
        }
        var index = -1;
        var next = function () { };
        var instance = {
            item: function (fn) {
                setTimeout(function () { nextItem(fn); }, 10);
                return instance;
            },
            done: function (fn) {
                next = fn;
            }
        };
        function nextItem(fn) {
            var r;
            index++;
            if (index < arrayOrObject.length) {
                r = fn(arrayOrObject[index], index, arrayOrObject);
                if (r && r.then) {
                    return r.then(function () {
                        setTimeout(function () { nextItem(fn); }, 10);
                    })
                        .catch(function () {
                        next();
                    });
                }
                return setTimeout(function () { nextItem(fn); }, 10);
            }
            next();
        }
        return instance;
    };
    function eachObj(object) {
        var keys = Object.keys(object);
        var index = -1;
        var next = function () { };
        var instance = {
            item: function (fn) {
                setTimeout(function () { nextItem(fn); }, 10);
                return instance;
            },
            done: function (fn) {
                next = fn;
            }
        };
        function nextItem(fn) {
            var k, r;
            index++;
            k = keys[index];
            if (k) {
                r = fn(object[k], k, object);
                if (r && r.then) {
                    return r.then(function () {
                        setTimeout(function () { nextItem(fn); }, 10);
                    })
                        .catch(function () {
                        next();
                    });
                }
                return setTimeout(function () { nextItem(fn); }, 10);
            }
            next();
        }
        return instance;
    }
});

define('aurelia-ui/core/ripple',["require", "exports"], function (require, exports) {
    "use strict";
    var touchStartX, touchStartY, touchStartTime;
    document.addEventListener('mousedown', function (e) {
        touchStartX = e.pageX;
        touchStartY = e.pageY;
    });
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/core/ui-attribute',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var UIAttribute = (function () {
        function UIAttribute(element) {
            this.isUIAttribute = true;
            element.isUIAttribute = true;
        }
        return UIAttribute;
    }());
    UIAttribute = __decorate([
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UIAttribute);
    exports.UIAttribute = UIAttribute;
});

define('aurelia-ui/core/ui-element',["require", "exports"], function (require, exports) {
    "use strict";
    function UIElementInit(instance, element) {
        instance.isUIElement = element['isUIElement'] = true;
        element.setAttribute('ui-element', '');
        element.setAttribute('tabindex', '1');
        element.addEventListener('focus', function (event) {
            var vm = this.au.controller.viewModel;
            if (vm.beforeFocus) {
                vm.beforeFocus(event);
            }
        });
        element.addEventListener('blur', function (event) {
            var vm = this.au.controller.viewModel;
            if (vm.beforeBlur) {
                vm.beforeBlur(event);
            }
        });
    }
    exports.UIElementInit = UIElementInit;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/icon',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var Icon = (function () {
        function Icon(e) {
            var link = e.getAttribute('src'), fill = e.getAttribute('color'), center = e.getAttribute('center'), size = Number(e.getAttribute('size') || 24), css = " width:" + size + "px;height:" + size + "px;", html;
            e['style'].cssText += css;
            if (center) {
                css += "position:absolute;top:50%;left:50%;margin-top:-" + size / 2 + "px;margin-left:-" + size / 2 + "px;";
            }
            fill = fill ? "fill:" + fill : '';
            html = "<svg class=\"icon" + size + "\" style=\"" + css + fill + "\"><use xlink:href=\"#" + link + "\"></use></svg>";
            e.innerHTML = html;
        }
        return Icon;
    }());
    Icon.inject = [Element];
    Icon = __decorate([
        aurelia_framework_1.noView,
        __metadata("design:paramtypes", [Element])
    ], Icon);
    exports.Icon = Icon;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/modal-view',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var ModalView = (function () {
        function ModalView(element) {
            this.element = element;
        }
        ModalView.prototype.loadView = function (index, url, viewModel, complete) {
            var vm;
            if (index < 5) {
                vm = viewModel || {};
                this['viewStrategy' + index] = url;
                this['viewModel' + index] = vm;
                this.element['_viewStrategyIndex'] = index;
                this.element.children[index].classList.add('modal-activate');
            }
        };
        ModalView.prototype.unloadView = function (index) {
            var e, wait;
            if (index < 5) {
                e = this.element.children[index];
                this['viewStrategy' + index] = null;
                this['viewModel' + index] = null;
                wait = function () {
                    if (e.children.length === 0) {
                        return e.classList.remove('modal-activate');
                    }
                    setTimeout(wait, 10);
                };
                wait();
            }
        };
        return ModalView;
    }());
    ModalView = __decorate([
        aurelia_framework_1.inlineView("\n<template>\n    <compose view.bind=\"viewStrategy0\" view-model.bind=\"viewModel0\"></compose>\n    <compose view.bind=\"viewStrategy1\" view-model.bind=\"viewModel1\"></compose>\n    <compose view.bind=\"viewStrategy2\" view-model.bind=\"viewModel2\"></compose>\n    <compose view.bind=\"viewStrategy3\" view-model.bind=\"viewModel3\"></compose>\n    <compose view.bind=\"viewStrategy4\" view-model.bind=\"viewModel4\"></compose>\n</template>"),
        aurelia_framework_1.inject(Element),
        aurelia_framework_1.customElement('modal-view'),
        __metadata("design:paramtypes", [HTMLElement])
    ], ModalView);
    exports.ModalView = ModalView;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-accordion',["require", "exports", "aurelia-framework", "../core/ui-element"], function (require, exports, aurelia_framework_1, ui_element_1) {
    "use strict";
    var UICheckbox = (function () {
        function UICheckbox(element) {
            this.opened = false;
            this.element = element;
            ui_element_1.UIElementInit(this, element);
        }
        UICheckbox.prototype.attached = function () {
        };
        UICheckbox.prototype.onTap = function () {
        };
        return UICheckbox;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UICheckbox.prototype, "opened", void 0);
    UICheckbox = __decorate([
        aurelia_framework_1.inlineView('<template>' +
            '<input type="radio" name="${name}" value="${value}"/>' +
            '<div><span></span></div>' +
            '</template>'),
        aurelia_framework_1.customElement('ui-accordion'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UICheckbox);
    exports.UICheckbox = UICheckbox;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-button',["require", "exports", "aurelia-framework", "../core/ui-element", "../core/index"], function (require, exports, aurelia_framework_1, ui_element_1, index_1) {
    "use strict";
    var UIButton = (function () {
        function UIButton(element) {
            ui_element_1.UIElementInit(this, element);
        }
        return UIButton;
    }());
    UIButton = __decorate([
        aurelia_framework_1.inlineView('<template><slot></slot></template>'),
        aurelia_framework_1.customElement('ui-button'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UIButton);
    exports.UIButton = UIButton;
    index_1.AUI.setPressedState('ui-button');
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-checkbox',["require", "exports", "aurelia-framework", "../core/ui-element"], function (require, exports, aurelia_framework_1, ui_element_1) {
    "use strict";
    var UICheckbox = (function () {
        function UICheckbox(element) {
            this.checked = false;
            this.element = element;
            ui_element_1.UIElementInit(this, element);
        }
        UICheckbox.prototype.attached = function () {
            this.checked = this.checked === 'true' || this.checked === true ? true : false;
            this.element.children[0].checked = this.checked;
        };
        UICheckbox.prototype.onTap = function () {
            this.checked = !this.checked;
        };
        return UICheckbox;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UICheckbox.prototype, "checked", void 0);
    UICheckbox = __decorate([
        aurelia_framework_1.inlineView('<template>' +
            '<input type="checkbox" checked.bind="checked"/>' +
            '<div><span></span></div>' +
            '</template>'),
        aurelia_framework_1.customElement('ui-checkbox'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UICheckbox);
    exports.UICheckbox = UICheckbox;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-drawer',["require", "exports", "aurelia-framework", "../core/modal-service", "../core/ui-element", "../core/index", "../core/index"], function (require, exports, aurelia_framework_1, modal_service_1, ui_element_1, index_1, index_2) {
    "use strict";
    var DRAWERS = {};
    var UIDrawer = (function () {
        function UIDrawer(element) {
            this.element = element;
            var name = element.getAttribute('name');
            DRAWERS[name] = element;
            this.element = element;
            ui_element_1.UIElementInit(this, element);
        }
        UIDrawer.prototype.attached = function () {
            this.transitionDuration = index_2.AUI.getTransitionDuration(this.element);
            this.element.children[1].setAttribute('style', this.element.getAttribute('style'));
            this.element.removeAttribute('style');
            this.updateDocumentBody();
        };
        UIDrawer.prototype.show = function () {
            this.element.setAttribute('state', 'open');
            this.updateDocumentBody();
            modal_service_1.ModalService.addCaptureCancel(this.cancelHandle, this);
        };
        UIDrawer.prototype.hide = function (fn) {
            this.element.removeAttribute('state');
            this.updateDocumentBody(true);
            modal_service_1.ModalService.removeCaptureCancel(this.cancelHandle);
            if (fn) {
                setTimeout(function () { fn(); }, this.transitionDuration);
            }
        };
        UIDrawer.prototype.onObfuscatorClick = function () {
            this.hide();
        };
        UIDrawer.prototype.cancelHandle = function (event) {
            var hash;
            if (this.obfuscatorIsVisible()) {
                event.cancel = true;
                if (event.target) {
                    hash = location.hash;
                    this.hide(function () {
                        location.hash = hash;
                    });
                }
                else {
                    this.hide();
                }
            }
        };
        UIDrawer.prototype.obfuscatorIsVisible = function () {
            return this.element.children[0].offsetWidth > 0;
        };
        UIDrawer.prototype.contentIsVisible = function () {
            var r = this.element.children[1].getBoundingClientRect();
            return r.left >= 0 || r.right >= 0;
        };
        UIDrawer.prototype.updateDocumentBody = function (forceHide) {
            if (forceHide === void 0) { forceHide = false; }
            if (forceHide || !this.contentIsVisible()) {
                document.body.classList.remove('drawer-open');
            }
            else {
                document.body.classList.add('drawer-open');
            }
        };
        return UIDrawer;
    }());
    UIDrawer = __decorate([
        aurelia_framework_1.inlineView("\n<template>\n    <div class=\"ui-drawer-obfuscator\" click.delegate=\"onObfuscatorClick()\"></div>\n    <div class=\"ui-drawer-content\">\n        <slot></slot>\n    </div>\n</template>"),
        aurelia_framework_1.customElement('ui-drawer'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [HTMLElement])
    ], UIDrawer);
    exports.UIDrawer = UIDrawer;
    index_1.Action.register('drawer', 'tap', function (evt, name) {
        var d = DRAWERS[name];
        if (d) {
            d.au.controller.viewModel.show();
        }
    });
    index_2.AUI.setPressedState('[action-drawer]');
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-progress',["require", "exports", "aurelia-framework", "../core/ui-element"], function (require, exports, aurelia_framework_1, ui_element_1) {
    "use strict";
    var template_circle = '<svg class="@{sgv-class}" viewBox="25 25 50 50">' +
        '<circle class="@{circle-class}" cx="50" cy="50" r="20" fill="none" @{stroke} stroke-width="@{width}"/>' +
        '</svg>' +
        '<div class="ui-progress-circular-label" @{fill}></div>';
    var template_bar = '<div class="ui-progress-bar"></div>';
    var UIProgress = (function () {
        function UIProgress(element) {
            this.type = 'bar';
            this.percent = '0';
            this.fill = null;
            this.borderWidth = '2';
            this.borderColor = null;
            this.showPercent = false;
            this.element = element;
            ui_element_1.UIElementInit(this, element);
        }
        UIProgress.prototype.created = function () {
            this.type == 'circle' ?
                this.typeCicleDraw() :
                this.typeBarDraw();
            this.isCreated = true;
        };
        UIProgress.prototype.percentChanged = function (value) {
            if (this.isCreated) {
                this.setPercent(value);
            }
        };
        UIProgress.prototype.setPercent = function (percent) {
            var style;
            if (this.type == 'circle') {
                var strokeDashoffset = -(this.strokeDasharray + (this.strokeDasharray * percent / 100));
                style = this.element.children[0].children[0]['style'];
                style['stroke-dasharray'] = String(this.strokeDasharray);
                style['stroke-dashoffset'] = String(strokeDashoffset);
                this.label.innerText = percent + '%';
            }
            else {
                style = this.element.children[0]['style'];
                style['transform'] = "translate3d(-" + (100 - percent) + "%, 0, 0)";
            }
        };
        UIProgress.prototype.typeCicleDraw = function () {
            var template = template_circle
                .replace('@{sgv-class}', 'ui-progress-circular' + (this.percent == 'infinite' ? ' ui-progress-circular-infinite' : ''))
                .replace('@{circle-class}', 'ui-progress-circular-path' + (this.percent == 'infinite' ? ' ui-progress-circular-path-infinite' : ''))
                .replace('@{width}', this.borderWidth)
                .replace('@{fill}', this.fill ? "style=\"background:" + this.fill + "\"" : '')
                .replace('@{stroke}', this.borderColor ? "style=\"stroke:" + this.borderColor + "\"" : '');
            this.element.className = 'ui-progress-c ' + this.element.className;
            this.element.innerHTML = template;
            this.label = this.element.children[1];
            if (this.percent != 'infinite') {
                var radius = Number(this.element.children[0].children[0].getAttribute('r'));
                this.strokeDasharray = 2 * radius * Math.PI;
                this.element.children[0].setAttribute('style', 'transform:rotate(-90deg);');
                this.setPercent(Number(this.percent || 0));
            }
        };
        UIProgress.prototype.typeBarDraw = function () {
            var template = template_bar;
            this.element.className = 'ui-progress-b ' + (this.percent == 'infinite' ? 'ui-progress-bar-infinite ' : '') + this.element.className;
            this.element.innerHTML = template;
            if (this.percent != 'infinite') {
                this.setPercent(Number(this.percent || 0));
            }
        };
        return UIProgress;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UIProgress.prototype, "type", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UIProgress.prototype, "percent", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UIProgress.prototype, "fill", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UIProgress.prototype, "borderWidth", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UIProgress.prototype, "borderColor", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UIProgress.prototype, "showPercent", void 0);
    UIProgress = __decorate([
        aurelia_framework_1.inlineView('<template></template>'),
        aurelia_framework_1.customElement('ui-progress'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UIProgress);
    exports.UIProgress = UIProgress;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-radio',["require", "exports", "aurelia-framework", "../core/ui-element"], function (require, exports, aurelia_framework_1, ui_element_1) {
    "use strict";
    var UICheckbox = (function () {
        function UICheckbox(element) {
            this.checked = false;
            this.element = element;
            ui_element_1.UIElementInit(this, element);
        }
        UICheckbox.prototype.attached = function () {
            this.checked = this.checked === 'true' || this.checked === true ? true : false;
            this.element.children[0].checked = this.checked;
        };
        UICheckbox.prototype.onTap = function () {
            this.element.children[0].checked = true;
        };
        return UICheckbox;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UICheckbox.prototype, "checked", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", String)
    ], UICheckbox.prototype, "value", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", String)
    ], UICheckbox.prototype, "name", void 0);
    UICheckbox = __decorate([
        aurelia_framework_1.inlineView('<template>' +
            '<input type="radio" name="${name}" value="${value}"/>' +
            '<div><span></span></div>' +
            '</template>'),
        aurelia_framework_1.customElement('ui-radio'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UICheckbox);
    exports.UICheckbox = UICheckbox;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-slider',["require", "exports", "aurelia-framework", "../core/ui-element"], function (require, exports, aurelia_framework_1, ui_element_1) {
    "use strict";
    var UISlider = (function () {
        function UISlider(element) {
            this.dragging = false;
            this.label = '';
            this.checked = false;
            this.element = element;
            ui_element_1.UIElementInit(this, element);
        }
        UISlider.prototype.onPanleft = function (event) {
            this.render(event.pointers[0].clientX);
        };
        UISlider.prototype.onPanright = function (event) {
            this.render(event.pointers[0].clientX);
        };
        UISlider.prototype.onTap = function (event) {
            this.render(event.pointers[0].clientX);
        };
        UISlider.prototype.onTouchend = function () {
            var self = this;
            setTimeout(function () { self.dragging = false; }, 1);
        };
        UISlider.prototype.render = function (x) {
            var e = this.element.children[1].children[0];
            var r = this.element.getBoundingClientRect();
            if (!this.dragging) {
                e.style.left = 0;
            }
            this.x = x - r.left - (e.offsetWidth / 2);
            this.dragging = true;
        };
        return UISlider;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UISlider.prototype, "label", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UISlider.prototype, "checked", void 0);
    UISlider = __decorate([
        aurelia_framework_1.inlineView('<template>' +
            '<label>${label}</label>' +
            '<div><span style="left:${x}px"></span></div>' +
            '</template>'),
        aurelia_framework_1.customElement('ui-slider'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UISlider);
    exports.UISlider = UISlider;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-switch',["require", "exports", "aurelia-framework", "../core/ui-element"], function (require, exports, aurelia_framework_1, ui_element_1) {
    "use strict";
    var UISwitch = (function () {
        function UISwitch(element) {
            this.label = '';
            this.checked = false;
            ui_element_1.UIElementInit(this, element);
        }
        return UISwitch;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UISwitch.prototype, "label", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UISwitch.prototype, "checked", void 0);
    UISwitch = __decorate([
        aurelia_framework_1.inlineView('<template>' +
            '<label>${label}</label>' +
            '<input type="checkbox" checked.bind="checked"/>' +
            '<div><span></span></div>' +
            '</template>'),
        aurelia_framework_1.customElement('ui-switch'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UISwitch);
    exports.UISwitch = UISwitch;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-ui/elements/ui-textfield',["require", "exports", "aurelia-framework", "../core/ui-element", "../core/index", "../core/dispatcher"], function (require, exports, aurelia_framework_1, ui_element_1, index_1, dispatcher_1) {
    "use strict";
    var UITextfield = (function () {
        function UITextfield(element) {
            this.placeholder = '';
            this.label = '';
            this.type = 'text';
            this.element = element;
            ui_element_1.UIElementInit(this, element);
        }
        UITextfield.prototype.beforeFocus = function () {
            this.input.focus();
            if (this.showClose != undefined) {
                this.button.style.display = 'flex';
            }
        };
        UITextfield.prototype.beforeBlur = function (event) {
            var target;
            if (event.preventLoop)
                return;
            dispatcher_1.default.delegate('blur', { preventLoop: true }, this.element);
            if (this.showClose != undefined) {
                target = index_1.DOMSelector.closet(event.relatedTarget, 'ui-button');
                if (target == this.button) {
                    return this.input.focus();
                }
                this.button.style.display = 'none';
            }
        };
        UITextfield.prototype.created = function () {
            var _this = this;
            this.input = this.element.children[1];
            this.button = this.element.children[2];
            if (this.showClose != undefined) {
                var onFocus = function () {
                    _this.beforeFocus();
                };
                var onBlur = function (event) {
                    _this.beforeBlur(event);
                };
                this.input.onfocus = onFocus;
                this.input.onblur = onBlur;
            }
            if (this.element.classList.contains('floating')) {
                this.label = this.placeholder;
                this.placeholder = '';
            }
        };
        UITextfield.prototype.valueChanged = function (value) {
            this.element.classList[value ? 'add' : 'remove']('notnull');
            dispatcher_1.default.delegate('changed', { value: value }, this.element);
        };
        UITextfield.prototype.focus = function () {
            this.input.focus();
        };
        UITextfield.prototype.onBtnClose_Click = function () {
            this.value = '';
        };
        return UITextfield;
    }());
    __decorate([
        aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }),
        __metadata("design:type", String)
    ], UITextfield.prototype, "value", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UITextfield.prototype, "placeholder", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UITextfield.prototype, "label", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UITextfield.prototype, "type", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], UITextfield.prototype, "showClose", void 0);
    UITextfield = __decorate([
        aurelia_framework_1.inlineView('<template>' +
            '<label>${label}</label>' +
            '<input type="${type}" placeholder="${placeholder}" value.bind="value" />' +
            '<ui-button style="display:none" click.delegate="onBtnClose_Click()"><icon src="icon-close"></icon></ui-button>' +
            '</template>'),
        aurelia_framework_1.customElement('ui-textfield'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [Object])
    ], UITextfield);
    exports.UITextfield = UITextfield;
});

define('modules/home/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Home = (function () {
        function Home() {
            var s = navigator.userAgent;
            this.userAgent = s;
        }
        return Home;
    }());
    exports.Home = Home;
});

define('modules/css/ui-breadcrumb/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Breadcrumb = (function () {
        function Breadcrumb() {
        }
        return Breadcrumb;
    }());
    exports.Breadcrumb = Breadcrumb;
});

define('modules/css/ui-card/index',["require", "exports"], function (require, exports) {
    "use strict";
    var UICard = (function () {
        function UICard() {
        }
        return UICard;
    }());
    exports.UICard = UICard;
});

define('modules/css/ui-list/index',["require", "exports"], function (require, exports) {
    "use strict";
    var UICard = (function () {
        function UICard() {
        }
        return UICard;
    }());
    exports.UICard = UICard;
});

define('modules/demo/form/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Form = (function () {
        function Form() {
        }
        return Form;
    }());
    exports.Form = Form;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('modules/demo/modals/index',["require", "exports", "aurelia-framework", "../../../aurelia-ui/core/ui-alert"], function (require, exports, aurelia_framework_1, ui_alert_1) {
    "use strict";
    var Modals = (function () {
        function Modals(alert) {
            this.alert = alert;
        }
        Modals.prototype.buttonAlertTap = function () {
            this.alert.show('Simple alert show', 'Aurelia UI');
        };
        Modals.prototype.buttonConfirmTap = function () {
            this.alert.show('Are you feel good today?', 'Aurelia UI', ['Cancelar', '<b>OK</b>'])
                .on('hide', function (index) {
                console.log(index);
            });
        };
        Modals.prototype.buttonPromptTap = function () {
            var template = '<ui-textfield value.bind="data.name" placeholder="What is your name"></ui-textfield>';
            this.alert.show('What is your name?', 'Aurelia UI', ['Cancelar', '<b>OK</b>'], template)
                .on('hide', function (index, data) {
                console.log(index, data);
            });
        };
        Modals.prototype.buttonLoginTap = function () {
            var _this = this;
            var template = "<ui-textfield class=\"floating\" value.bind=\"data.username\" placeholder=\"Username\"></ui-textfield>\n             <ui-textfield class=\"floating\" value.bind=\"data.password\" placeholder=\"Password\" type=\"password\"></ui-textfield>";
            this.alert.show('Enter your username and password', 'Aurelia UI', ['CANCEL', '<b>OK</b>'], template)
                .on('hide', function (index, data) {
                var s = "<p>Username=<b>" + data.username + "</b></p>\n                         <p>Password=<b>" + data.password + "</b></p>";
                if (index == 1)
                    _this.alert.show(s, 'Aurelia UI');
            });
        };
        Modals.prototype.buttonPasswordTap = function () {
            var template = '<ui-textfield value.bind="data.password" placeholder="Password" type="password"></ui-textfield>';
            this.alert.show('Enter your password', 'Aurelia UI', ['Cancelar', '<b>OK</b>'], template)
                .on('hide', function (index, data) {
                console.log(index, data);
            });
        };
        Modals.prototype.buttonModalView = function () {
            location.hash = '#/modal/view1';
        };
        return Modals;
    }());
    Modals = __decorate([
        aurelia_framework_1.inject(ui_alert_1.UIAlert),
        __metadata("design:paramtypes", [ui_alert_1.UIAlert])
    ], Modals);
    exports.Modals = Modals;
});

define('modules/demo/modals/source',["require", "exports"], function (require, exports) {
    "use strict";
    var Source = (function () {
        function Source(source) {
            if (source === void 0) { source = ''; }
            this.source = source;
        }
        Source.prototype.setRouterParam = function (name, code) {
            this.source = code;
        };
        Source.prototype.btCloseTap = function () {
            history.back();
        };
        return Source;
    }());
    exports.Source = Source;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('modules/demo/modals/view1',["require", "exports", "../../../aurelia-ui/core/ui-alert", "aurelia-framework"], function (require, exports, ui_alert_1, aurelia_framework_1) {
    "use strict";
    var View1 = (function () {
        function View1(uiAlert, text) {
            if (text === void 0) { text = 'View 01'; }
            this.uiAlert = uiAlert;
            this.text = text;
            console.log(this.uiAlert);
        }
        View1.prototype.btPopupTap = function () {
            location.hash = '#/modal/view2';
        };
        View1.prototype.btAlertTap = function () {
            this.uiAlert.show('UIAlert Show');
        };
        View1.prototype.btDoneTap = function () {
            history.back();
        };
        return View1;
    }());
    View1 = __decorate([
        aurelia_framework_1.inject(ui_alert_1.UIAlert),
        __metadata("design:paramtypes", [ui_alert_1.UIAlert, Object])
    ], View1);
    exports.View1 = View1;
});

define('modules/demo/modals/view2',["require", "exports"], function (require, exports) {
    "use strict";
    var View2 = (function () {
        function View2() {
            this.text = 'VVVV';
        }
        View2.prototype.onButtonTap = function () {
            history.back();
        };
        return View2;
    }());
    exports.View2 = View2;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('modules/demo/search/index',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var DemoSearch = (function () {
        function DemoSearch() {
            this.search = '';
            this.cars = this.origialCars = ['Honda', 'Lexus', 'Mazda', 'Nissan', 'Toyota', 'Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Volvo', 'Cadillac', 'Chrysler', 'Dodge', 'Ford'];
        }
        DemoSearch.prototype.searchChanged = function (value) {
            this.cars = this.origialCars.filter(function (item) {
                return item.toLowerCase().search(value.toLowerCase()) == -1 ? false : true;
            });
        };
        return DemoSearch;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], DemoSearch.prototype, "search", void 0);
    exports.DemoSearch = DemoSearch;
});

define('modules/element/ui-button/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Buttons = (function () {
        function Buttons() {
        }
        Buttons.prototype.onTap = function () {
            location.hash = '#/checkbox';
        };
        return Buttons;
    }());
    exports.Buttons = Buttons;
});

define('modules/element/ui-checkbox/index',["require", "exports"], function (require, exports) {
    "use strict";
    var Checkbox = (function () {
        function Checkbox() {
        }
        return Checkbox;
    }());
    exports.Checkbox = Checkbox;
});

define('modules/element/ui-progress/index',["require", "exports"], function (require, exports) {
    "use strict";
    var ViewUIProgress = (function () {
        function ViewUIProgress() {
            var _this = this;
            this.percent = 0;
            this.percent1 = 0;
            var p = this.percent;
            var fn = function () {
                _this.percent += 1;
                if (_this.percent < 100) {
                    setTimeout(fn, 200);
                }
            };
            setTimeout(fn, 2000);
        }
        ViewUIProgress.prototype.setPercent = function (percent) {
            this.percent1 = percent;
        };
        return ViewUIProgress;
    }());
    exports.ViewUIProgress = ViewUIProgress;
});

define('modules/element/ui-radio/index',["require", "exports"], function (require, exports) {
    "use strict";
    var UIRadio = (function () {
        function UIRadio() {
        }
        return UIRadio;
    }());
    exports.UIRadio = UIRadio;
});

define('modules/element/ui-slider/index',["require", "exports"], function (require, exports) {
    "use strict";
    var ViewSlider = (function () {
        function ViewSlider() {
        }
        return ViewSlider;
    }());
    exports.ViewSlider = ViewSlider;
});

define('modules/element/ui-textfield/index',["require", "exports"], function (require, exports) {
    "use strict";
    var ViewTextfield = (function () {
        function ViewTextfield() {
        }
        return ViewTextfield;
    }());
    exports.ViewTextfield = ViewTextfield;
});

define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <ui-drawer name=\"drawer1\" docked style=\"width:280px\">\n        <page-header>\n            <page-header-title>Aurelia UI</page-header-title>\n        </page-header>\n        <page-content class=\"list\">\n            <a class=\"hbox\" style=\"align-items:center;padding:12px 15px;margin-top:10px;\" href=\"#/home\">\n                <icon style=\"margin-right:12px\" src=\"icon-home\"></icon>\n                <span>Home</span>\n            </a>\n\n            <div class=\"content-block-title\">CSS Elements</div>\n            <list-block class=\"home-list\">\n                <a repeat.for=\"item of roters_css\" class=\"list-item item-link\" href=\"#/${item}\">\n                    <div class=\"item-content\">${item}</div>\n                </a>\n            </list-block>\n\n            <div class=\"content-block-title\">Custom Elements</div>\n            <list-block class=\"home-list\">                \n                <a repeat.for=\"item of roters_element\" class=\"list-item item-link\" href=\"#/${item}\">\n                    <div class=\"item-content\">${item}</div>\n                </a>\n            </list-block>\n\n            <div class=\"content-block-title\">Demos</div>\n            <list-block class=\"home-list\">                \n                <a repeat.for=\"item of roters_demo\" class=\"list-item item-link\" href=\"#/${item}\">\n                    <div class=\"item-content\">${item}</div>\n                </a>\n            </list-block>\n        </page-content>\n    </ui-drawer>\n    <router-view class=\"page-container\" swap-order=\"with\"></router-view>\n    <modal-view></modal-view>\n</template>"; });
define('text!modules/home/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate main-view\">\n        <page-header style=\"justify-content:flex-start;\">\n            <ui-button class=\"button-page-header\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </ui-button>\n            <page-header-title>HOME</page-header-title>\n        </page-header>\n        <page-content>\n            <style>\n                .tests div{text-align:center}\n            </style>\n            <div class=\"content-block\">\n                <div class=\"content-block-title\">\n                    Pallete Color\n                </div>\n                <ui-card class=\"tests\">\n                    <div class=\"ui-card-content\">\n                        <div class=\"dSecondary c50\">50</div>\n                        <div class=\"dSecondary c100\">100</div>\n                        <div class=\"dSecondary c200\">200</div>\n                        <div class=\"dSecondary c300\">300</div>\n                        <div class=\"dSecondary c400\">400</div>\n                        <div class=\"c500\">500</div>\n                        <div class=\"lSecondary c600\">600</div>\n                        <div class=\"lSecondary c700\">700</div>\n                        <div class=\"lSecondary c800\">800</div>\n                        <div class=\"lSecondary c900\">900</div>\n                        <div class=\"dSecondary a100\">A100</div>\n                        <div class=\"dSecondary a200\">A200</div>\n                        <div class=\"lSecondary a400\">A400</div>\n                        <div class=\"lSecondary a700\">A700</div>\n                    </div>\n                </ui-card>\n\n                <div class=\"content-block-title\">\n                    Light Colors\n                </div>\n                <ui-card class=\"tests\">\n                    <div class=\"lPrimary background\">ligth primary text</div>\n                    <div class=\"lSecondary background\">ligth secondary text</div>\n                    <div class=\"lDisabled background\">ligth disabled text</div>\n                    <div class=\"lDividers background\">ligth dividers color</div>\n                </ui-card>\n\n                <div class=\"content-block-title\">\n                    Dark Colors\n                </div>\n                <ui-card class=\"tests\">\n                    <div class=\"dPrimary\">dark primary text</div>\n                    <div class=\"dSecondary\">dark secondary text</div>\n                    <div class=\"dDisabled\">dark disabled text</div>\n                    <div class=\"dDividers\">dark dividers color</div>\n                </ui-card>\n\n                <div class=\"content-block-title\">\n                    Outhers\n                </div>\n                <ui-card class=\"tests\">\n                    <div class=\"lPrimary statusBar\">status bar background</div>\n                    <div class=\"lPrimary appBar\">app bar background</div>\n                    <div class=\"lPrimary background\">window background</div>\n                    <div class=\"dPrimary dialog\">dialog background</div>\n                </ui-card>\n                <p> </p><p> </p>\n                <ui-card>\n                    <div class=\"ui-card-header\">\n                        User Agent\n                    </div>\n                    <div class=\"ui-card-content\">\n                        ${userAgent}\n                    </div>\n                </ui-card>\n\n                <ui-button class=\"raised fill color-red\" tap.delegate=\"onGitHubTap()\" style=\"margin:8px;\">\n                    <icon src=\"icon-git\"></icon>\n                    <div style=\"margin-left:10px;\">Fork me in github</div>\n                </ui-button>\n            </div>\n        </page-content>\n    </page>\n</template>"; });
define('text!modules/css/ui-breadcrumb/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate main-view\">\n        <page-header style=\"justify-content:flex-start;\">\n            <ui-button class=\"button-page-header\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </ui-button>\n            <page-header-title style=\"flex:1\">ui-breadcrumb</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/css/ui-breadcrumb/index', 'ui-breadcrumb-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content id=\"ui-breadcrumb-id\"  class=\"content-block\">\n            <ui-breadcrumb>\n                <li>\n                    <icon src=\"icon-home\"></icon>\n                </li>\n                <li>\n                    <icon src=\"icon-skip-next\"></icon>\n                    Aurelia-UI\n                </li>\n                <li>\n                    <icon src=\"icon-skip-next\"></icon>\n                    Breadcrumb\n                </li>\n            </ui-breadcrumb>\n        </page-content>\n    </page>\n</template>"; });
define('text!modules/css/ui-card/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate\">\n        <page-header style=\"justify-content:flex-start;\">\n            <ui-button class=\"button-page-header\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </ui-button>\n            <page-header-title style=\"flex:1\">ui-card</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/css/ui-card/index', 'ui-card-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content>\n            <div id=\"ui-card-id\" code=\"ui-card\" class=\"content-block\">\n                <div class=\"content-block-title\">Simple Cards</div>\n                <ui-card>\n                    <div class=\"ui-card-content\">\n                       This is simple card with plain text. But card could contain its own header, footer, list view, image, and any elements inside.\n                    </div>\n                </ui-card>\n                <ui-card>\n                    <div class=\"ui-card-header\">\n                        Card header\n                    </div>\n                    <div class=\"ui-card-content\">\n                        Card with header and footer. Card header is used to display card title and footer for some additional information or for custom actions..\n                    </div>\n                    <div class=\"ui-card-footer\">\n                        Card Footer\n                    </div>\n                </ui-card>\n\n                <div class=\"content-block-title\">Styled Cards</div>\n                <ui-card>\n                    <div style=\"background-image:url(images/nature3.jpg);\" \n                         class=\"ui-card-header ui-card-image\">\n                         Journey To Mountains\n                    </div>\n                    <div class=\"ui-card-content\">\n                       <p class=\"color-gray\">Posted on January 21, 2015</p>\n                       <p>Quisque eget vestibulum nulla. Quisque quis dui quis ex ultricies efficitur vitae non felis. Phasellus quis nibh hendrerit...</p>\n                    </div>\n                    <div class=\"ui-card-footer\">\n                        <ui-button>LIKE</ui-button>\n                        <ui-button>READ MORE</ui-button>\n                    </div>\n                </ui-card>\n            </div>\n        </page-content>\n    </page>\n</template>"; });
define('text!app-styles/android.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n.git-link,\n.git-link icon {\n  color: #ff4343;\n  fill: #ff4343;\n}\n.buttons-row {\n  justify-content: space-between;\n}\n.buttons-row ui-button {\n  margin: 0 10px 10px 10px;\n  flex: 1;\n}\n.buttons-row ui-button:first-child {\n  margin-left: 0;\n}\n.buttons-row ui-button:last-child {\n  margin-right: 0;\n}\n.ckecboxes-list .item-content {\n  margin-left: 16px;\n}\n.bt-back {\n  display: none;\n}\n.buttons-checkbox .bt-back {\n  display: initial;\n}\n.buttons-checkbox .bt-menu {\n  display: none;\n}\n.c50 {\n  background: #d4ebfd;\n}\n.c100 {\n  background: #b7ddfb;\n}\n.c200 {\n  background: #9acffa;\n}\n.c300 {\n  background: #4dabf5;\n}\n.c400 {\n  background: #309df4;\n}\n.c500 {\n  background: #2196F3;\n}\n.c600 {\n  background: #0b79d1;\n}\n.c700 {\n  background: #0a71c2;\n}\n.c800 {\n  background: #0a68b4;\n}\n.c900 {\n  background: #0960a5;\n}\n.a100 {\n  background: #fff0f0;\n}\n.a200 {\n  background: #ffd2d2;\n}\n.a400 {\n  background: #ff4343;\n}\n.a700 {\n  background: #ff0b0b;\n}\n.lPrimary {\n  color: #fff;\n}\n.lSecondary {\n  color: rgba(255, 255, 255, 0.7);\n}\n.lDisabled {\n  color: rgba(255, 255, 255, 0.5);\n}\n.lDividers {\n  color: rgba(255, 255, 255, 0.12);\n}\n.dPrimary {\n  color: #000;\n}\n.dSecondary {\n  color: rgba(0, 0, 0, 0.7);\n}\n.dDisabled {\n  color: rgba(0, 0, 0, 0.5);\n}\n.dDividers {\n  color: rgba(0, 0, 0, 0.12);\n}\n.statusBar {\n  background: #2196F3;\n}\n.appBar {\n  background: #0b79d1;\n}\n.background {\n  background: #4f4f4f;\n}\n.dialog {\n  background: #fff;\n}\n@media screen and (min-width: 780px) and (orientation: landscape) {\n  .page-container {\n    left: 280px;\n  }\n  [action-drawer] {\n    display: none!important;\n  }\n}\n"; });
define('text!app-styles/ios.css', ['module'], function(module) { module.exports = ""; });
define('text!aurelia-ui/themes/android/_colors-blue.css', ['module'], function(module) { module.exports = ""; });
define('text!aurelia-ui/themes/android/_colors-kurier.css', ['module'], function(module) { module.exports = ""; });
define('text!modules/css/ui-list/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate\">\n        <page-header style=\"justify-content:flex-start;\">\n            <ui-button class=\"button-page-header\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </ui-button>\n            <page-header-title style=\"flex:1\">ui-list</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/css/ui-list/index', 'ui-list-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content>\n            <div id=\"ui-list-id\" class=\"content-block\">\n                <div class=\"content-block-title\">Simple List</div>\n                <ui-list>\n                    <div class=\"list-item\">\n                        Item 01\n                    </div>\n                    <div class=\"list-item\">\n                        Item 02\n                    </div>\n                    <div class=\"list-item\">\n                        Item 03\n                    </div>\n                </ui-list>\n\n                <div class=\"content-block-title\">Link itens</div>\n                <ui-list>\n                    <div class=\"list-item item-link\">\n                        Link Item 01\n                    </div>\n                    <div class=\"list-item item-link\">\n                        Link Item 02\n                    </div>\n                    <div class=\"list-item item-link\">\n                        Link Item 03\n                    </div>\n                </ui-list>\n\n                <div class=\"content-block-title\">List with separator</div>\n                <ui-list>\n                    <div class=\"list-item item-link\">\n                        <div class=\"item-content\">\n                            <span style=\"flex:1;\">Content Item 01</span>\n                            <div style=\"margin-right:56px;\" class=\"item-text item-subtitle\">Subtitle</div>\n                        </div>\n                    </div>\n                    <div class=\"list-item item-link\">\n                        <div class=\"item-content\">\n                            Content Item 02\n                        </div>\n                    </div>\n                    <div class=\"list-item item-link\">\n                        <div class=\"item-content\">\n                            Content Item 03\n                        </div>\n                    </div>\n                </ui-list>\n\n                <div class=\"content-block-title\">List with icons</div>\n                <ui-list>\n                    <div class=\"list-item item-link\">\n                        <icon class=\"item-media\" src=\"icon-account\"></icon>\n                        <div class=\"item-content\">\n                            Content Item 01\n                        </div>\n                    </div>\n                    <div class=\"list-item item-link\">\n                        <icon class=\"item-media\" src=\"icon-calendar-today\"></icon>\n                        <div class=\"item-content\">\n                            Content Item 02\n                        </div>\n                    </div>\n                    <div class=\"list-item item-link\">\n                        <icon class=\"item-media\" src=\"icon-settings\"></icon>\n                        <div class=\"item-content\">\n                            Content Item 03\n                        </div>\n                    </div>\n                </ui-list>\n\n                <div class=\"content-block-title\">Grouped List</div>\n                <ui-list>\n                    <div class=\"list-title\">A</div>\n                    <div class=\"list-item\"><div class=\"item-content\">Aaron</div></div>\n                    <div class=\"list-item\"><div class=\"item-content\">Abbie</div></div>\n                    <div class=\"list-item\"><div class=\"item-content\">Adam</div></div>\n                </ui-list>\n                <ui-list>\n                    <div class=\"list-title\">B</div>\n                    <div class=\"list-item\"><div class=\"item-content\">Bailey</div></div>\n                    <div class=\"list-item\"><div class=\"item-content\">Bailey</div></div>\n                    <div class=\"list-item\"><div class=\"item-content\">Bartolo</div></div>\n                </ui-list>\n            </div>\n        </page-content>\n    </page>\n</template>"; });
define('text!aurelia-ui/themes/android/_colors-pmdf.css', ['module'], function(module) { module.exports = ""; });
define('text!modules/demo/modals/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate modals\">\n        <page-header>\n            <button action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </button>\n            <page-header-title>Modals</page-header-title>\n        </page-header>\n        <page-content class=\"content-block\">\n            <p>There are 1:1 replacements of native Alert, Prompt and Confirm modals. \n                They support callbacks, have very easy api and can be combined with each other. \n                Check these examples:\n            </p>\n            <hbox class=\"buttons-row\">\n                <ui-button class=\"raised\" tap.delegate=\"buttonAlertTap()\"><div>ALERT</div></ui-button>\n                <ui-button class=\"raised\" tap.delegate=\"buttonConfirmTap()\">CONFIRM</ui-button>\n                <ui-button class=\"raised\" tap.delegate=\"buttonPromptTap()\">PROMPT</ui-button>\n            </hbox>\n            <hbox class=\"buttons-row\">\n                <ui-button class=\"raised\" tap.delegate=\"buttonLoginTap()\">LOGIN MODAL</ui-button>\n                <ui-button class=\"raised\" tap.delegate=\"buttonPasswordTap()\">PASSWORD</ui-button>\n            </hbox>\n            <hbox class=\"buttons-row\">\n                <ui-button class=\"raised\">ACTION SHEET</ui-button>\n                <ui-button class=\"raised\" tap.delegate=\"buttonModalView()\">POPUP</ui-button>\n            </hbox>\n        </page-content>\n    </page>\n</template>"; });
define('text!modules/demo/modals/source.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate modals\">\n        <page-header style=\"padding:0 16px\">\n            <b style=\"flex:1\">View Source</b>\n            <ui-button style=\"height:100%\" tap.delegate=\"btCloseTap()\">CLOSE</ui-button>\n        </page-header>\n        <page-content innerhtml.bind=\"source\" class=\"content-block\"></page-content>\n    </page>\n</template>"; });
define('text!modules/demo/modals/view1.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate modals\">\n        <page-header style=\"padding:0 16px\">\n            <b style=\"flex:1\">Modal Popup View 1</b>\n            <ui-button style=\"height:100%\" tap.delegate=\"btDoneTap()\">DONE</ui-button>\n        </page-header>\n        <page-content class=\"content-block\">\n            <h1>Content ${text}</h1>\n            <ui-button tap.delegate=\"btAlertTap()\">SHOW ALERT</ui-button>\n            <ui-button tap.delegate=\"btPopupTap()\">SHOW POPUP VIEW 02</ui-button>\n        </page-content>\n    </page>\n</template>"; });
define('text!modules/demo/modals/view2.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate modals\">\n        <page-header>\n            Modal Popup View 2\n        </page-header>\n        <page-content class=\"content-block\">\n            <h1>Content ${text}</h1>\n            <ui-button tap.delegate=\"onButtonTap()\">CLOSE</ui-button>\n        </page-content>\n    </page>\n</template>"; });
define('text!modules/demo/form/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate\">\n        <page-header>\n            <button action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </button>\n            <page-header-title>Form Elements</page-header-title>\n        </page-header>\n        <page-content class=\"list\">\n            <div class=\"content-block-title\">Full Layout</div>\n            <list-block>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-account\"></icon>\n                    <div class=\"item-content\">\n                        <ui-textfield style=\"flex:1;\" label=\"Name\" placeholder=\"Your name\"></ui-textfield>\n                    </div>\n                </div>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-email\"></icon>\n                    <div class=\"item-content\">\n                        <ui-textfield style=\"flex:1;\" label=\"E-mail\" placeholder=\"E-mail\"></ui-textfield>                        \n                    </div>\n                </div>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-calendar-today\"></icon>\n                    <div class=\"item-content\">\n                        <ui-textfield style=\"flex:1;\" label=\"Bird date\" type=\"date\"></ui-textfield>                        \n                    </div>\n                </div>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-check\"></icon>\n                    <div class=\"item-content\" style=\"border-bottom:none\">\n                        <ui-switch label=\"Switch\" checked=\"true\"></ui-switch>                        \n                    </div>\n                </div>\n                <div class=\"list-item\" style=\"padding-top:10px\">\n                    <icon class=\"item-left\" src=\"icon-settings\"></icon>\n                    <div class=\"item-content\">\n                        <ui-slider label=\"Slider\"></ui-slider>                        \n                    </div>\n                </div>\n            </list-block>\n\n            <div class=\"content-block-title\">With Floating Labels</div>\n            <list-block>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-account\"></icon>\n                    <div class=\"item-content\">\n                        <ui-textfield style=\"flex:1;\" class=\"floating\" placeholder=\"Your name\"></ui-textfield>\n                    </div>\n                </div>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-email\"></icon>\n                    <div class=\"item-content\">\n                        <ui-textfield style=\"flex:1;\" class=\"floating\" placeholder=\"E-mail\"></ui-textfield>                        \n                    </div>\n                </div>\n            </list-block>\n\n            <div class=\"content-block-title\">Icons and Labels</div>\n            <list-block>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-account\"></icon>\n                    <div class=\"item-content\">\n                        <ui-textfield style=\"flex:1;\" placeholder=\"Your name\"></ui-textfield>\n                    </div>\n                </div>\n                <div class=\"list-item\">\n                    <icon class=\"item-left\" src=\"icon-email\"></icon>\n                    <div class=\"item-content\">\n                        <ui-textfield style=\"flex:1;\" placeholder=\"E-mail\"></ui-textfield>                        \n                    </div>\n                </div>\n            </list-block>      \n        </page-content>\n    </page>\n</template>\n"; });
define('text!aurelia-ui/themes/android/_index.css', ['module'], function(module) { module.exports = "* {\n  -webkit-tap-highlight-color: transparent;\n  -webkit-touch-callout: none;\n  box-sizing: border-box;\n}\nbody {\n  font-family: Roboto, Noto, Helvetica, Arial, sans-serif;\n  margin: 0;\n  padding: 0;\n  fill: #757575;\n  color: #212121;\n  font-size: 14px;\n  line-height: 1.5;\n  width: 100%;\n  -webkit-text-size-adjust: 100%;\n  background: #fff;\n  overflow: hidden;\n}\n[ui-element] {\n  -webkit-user-select: none;\n  user-select: none;\n  display: block;\n}\n.content-block-title {\n  position: relative;\n  overflow: hidden;\n  margin: 0;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  line-height: 1;\n  margin: 16px 16px 16px;\n  padding-top: 16px;\n  line-height: 16px;\n  font-weight: bold;\n  color: rgba(45, 45, 45, 0.54);\n}\n.absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n/* layout manager */\nhbox,\n.hbox {\n  display: flex;\n  justify-content: flex-start;\n  align-items: stretch;\n  flex-direction: row;\n}\nvbox,\n.vbox {\n  display: flex;\n  justify-content: flex-start;\n  align-items: stretch;\n  flex-direction: column;\n}\nclient,\n.client {\n  flex: 1;\n  position: relative;\n}\nvbox[layout=\"start\"],\nhbox[layout=\"start\"],\n.vbox[layout=\"start\"],\n.hbox[layout=\"start\"] {\n  justify-content: flex-start;\n}\nvbox[layout=\"center\"],\nhbox[layout=\"center\"],\n.vbox[layout=\"center\"],\n.hbox[layout=\"center\"] {\n  justify-content: center;\n}\nvbox[layout=\"end\"],\nhbox[layout=\"end\"],\n.vbox[layout=\"end\"],\n.hbox[layout=\"end\"] {\n  justify-content: flex-end;\n}\nvbox[layout=\"space-around\"],\nhbox[layout=\"space-around\"],\n.vbox[layout=\"space-around\"],\n.hbox[layout=\"space-around\"] {\n  justify-content: space-around;\n}\nvbox[layout=\"space-between\"],\nhbox[layout=\"space-between\"],\n.vbox[layout=\"space-between\"],\n.hbox[layout=\"space-between\"] {\n  justify-content: space-between;\n}\nvbox[layout=\"center center\"],\nhbox[layout=\"center\"],\n.vbox[layout=\"center center\"],\n.hbox[layout=\"center\"] {\n  justify-content: center;\n  align-items: center;\n}\n.spacer {\n  flex-grow: 1;\n}\n.full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n/* icon */\nicon {\n  display: block;\n  position: relative;\n}\nicon svg {\n  fill: inherit;\n}\n/* native elements */\n* {\n  outline: 0;\n}\na {\n  color: inherit;\n  text-decoration: none;\n}\nbutton {\n  transition-duration: .3s;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n}\nbutton[is-pressed] {\n  background: rgba(0, 0, 0, 0.1);\n}\n/* page element */\npage {\n  background: #fff;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\npage {\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\npage-content {\n  position: absolute;\n  overflow: auto;\n  left: 0;\n  width: 100%;\n  top: 56px;\n  bottom: 0;\n  padding-bottom: 20px;\n}\n.button-page-header {\n  padding: 0 16px;\n  height: 100%;\n}\n.page-container {\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.content-block {\n  margin: 32px 0;\n  padding: 0 16px;\n}\n.popup-overlay {\n  z-index: 60;\n  display: block;\n  position: fixed;\n  top: 0;\n  left: 0;\n  background: rgba(0, 0, 0, 0.4);\n}\n.popup-overlay page {\n  position: fixed;\n}\nmodal-view {\n  z-index: 40;\n  position: fixed;\n  top: 0;\n  left: 0;\n}\nmodal-view page {\n  position: fixed;\n}\n/* comportamento com tela de 780px ou mais */\n@media screen and (min-width: 780px) and (orientation: landscape) {\n  compose.modal-activate {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(123, 123, 123, 0.4);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n  compose.modal-activate page {\n    position: relative;\n    min-width: 500px;\n    min-height: 400px;\n    width: initial;\n    height: initial;\n    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n  }\n}\ni.icon {\n  display: inline-block;\n  vertical-align: middle;\n  background-size: 100% auto;\n  background-position: center;\n  background-repeat: no-repeat;\n  font-style: normal;\n  position: relative;\n}\ni.icon.icon-back {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M20%2011H7.83l5.59-5.59L12%204l-8%208%208%208%201.41-1.41L7.83%2013H20v-2z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-forward {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M12%204l-1.41%201.41L16.17%2011H4v2h12.17l-5.58%205.59L12%2020l8-8z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-bars {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M3%2018h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-camera {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D'%23333'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%20width%3D'24'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Ccircle%20cx%3D'12'%20cy%3D'12'%20r%3D'3.2'%2F%3E%3Cpath%20d%3D'M9%202L7.17%204H4c-1.1%200-2%20.9-2%202v12c0%201.1.9%202%202%202h16c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2h-3.17L15%202H9zm3%2015c-2.76%200-5-2.24-5-5s2.24-5%205-5%205%202.24%205%205-2.24%205-5%205z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-next {\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20fill%3D'%23ffffff'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M10%206L8.59%207.41%2013.17%2012l-4.58%204.59L10%2018l6-6z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-prev {\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20fill%3D'%23ffffff'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M15.41%207.41L14%206l-6%206%206%206%201.41-1.41L10.83%2012z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-plus {\n  width: 24px;\n  height: 24px;\n  font-size: 0;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D'%23FFFFFF'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%20width%3D'24'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'M19%2013h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-close {\n  width: 24px;\n  height: 24px;\n  font-size: 0;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D'%23FFFFFF'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%20width%3D'24'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\n.modal {\n  z-index: 50;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.modal-overlay {\n  background: rgba(0, 0, 0, 0.4);\n}\n.modal-alert {\n  color: #000;\n  background: #fff;\n  min-width: 260px;\n  border-radius: 3px;\n  font-size: 16px;\n  padding: 24px 24px 2px 20px;\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n.modal-alert-title {\n  color: #000;\n  font-weight: 500;\n  font-size: 20px;\n  line-height: 1.3;\n}\n.modal-alert-text {\n  line-height: 1.5;\n}\n.modal-alert-title + .modal-alert-text {\n  margin-top: 20px;\n}\n.modal-alert-buttons {\n  justify-content: flex-end;\n  height: 48px;\n  padding: 6px 8px;\n  margin: 14px -24px 0 -20px;\n  overflow: hidden;\n}\n/* força usar 3D */\n.modal-overlay,\n.modal-alert {\n  transform: translate3d(0, 0, 0);\n}\n/* efeitos de entrada e saída do overlay */\n.modal-overlay.au-enter-active {\n  animation: overlayShow .4s;\n}\n.modal-overlay.au-leave-active {\n  animation: overlayHide .4s;\n}\n/* efeitos de entrada e saída do alert */\n.modal-overlay.au-enter-active .modal-alert {\n  animation: alertShow .4s;\n}\n.modal-overlay.au-leave-active .modal-alert {\n  animation: alertHide .4s;\n}\n@keyframes overlayShow {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@keyframes overlayHide {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes alertShow {\n  0% {\n    opacity: 0;\n    transform: scale(1.185);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n@keyframes alertHide {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.8);\n  }\n}\nui-card,\n.ui-card {\n  background: #fff;\n  display: block;\n  margin: 8px;\n  position: relative;\n  border-radius: 2px;\n  font-size: 14px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.ui-card-content {\n  position: relative;\n  padding: 16px;\n}\n.ui-card-header,\n.ui-card-footer {\n  min-height: 48px;\n  position: relative;\n  padding: 4px 16px;\n  box-sizing: border-box;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.ui-card-header {\n  border-radius: 2px 2px 0 0;\n  font-size: 16px;\n}\n.ui-card-footer {\n  color: rgba(0, 0, 0, 0.7);\n  border-radius: 0 0 2px 2px;\n}\n.ui-card-image {\n  color: #fff;\n  height: 190px;\n  align-items: flex-end;\n}\n/* list element */\nui-list,\n.ui-list {\n  border-color: #e1e1e1;\n  overflow: auto;\n  display: block;\n  border-top-style: solid;\n  border-width: 1px;\n}\nui-list-block,\n.ui-list-block {\n  border-top: solid 1px #e1e1e1;\n  display: block;\n  margin: 32px 0;\n  font-size: 16px;\n}\nui-list-item,\nlist-item,\n.ui-list-item,\n.list-item {\n  display: flex;\n  position: relative;\n  padding-left: 16px;\n  min-height: 48px;\n  align-items: center;\n  transition-property: background;\n  transition-duration: .3s;\n  cursor: pointer;\n}\nui-list-item icon,\n.ui-list-item icon {\n  width: 24px;\n  height: 24px;\n}\nui-list-item,\n.ui-list-item[is-pressed] {\n  background-color: rgba(0, 0, 0, 0.1) !important;\n}\n.list-title {\n  background: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.7);\n  padding: 0 16px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  height: 48px;\n  line-height: 48px;\n  font-size: 14px;\n}\n.item-link {\n  background-size: 10px 20px;\n  background-repeat: no-repeat;\n  background-position: 95% center;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%2060%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'm60%2061.5-38.25%2038.25-9.75-9.75%2029.25-28.5-29.25-28.5%209.75-9.75z'%20fill%3D'%23c7c7cc'%2F%3E%3C%2Fsvg%3E\");\n}\n.item-media {\n  height: 100%;\n  width: 40px;\n  margin-right: 12px;\n  display: flex;\n  align-items: center;\n}\n.item-media img {\n  width: auto;\n  height: auto;\n  max-width: 40px;\n  border-radius: 50%;\n}\n.item-content {\n  border-bottom: solid 1px #e1e1e1;\n  display: flex;\n  width: 100%;\n  min-height: 48px;\n  align-items: center;\n  margin-right: 8px;\n}\n.item-left {\n  margin-right: 22px;\n}\n.item-content-multiline {\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 8px 0;\n}\n.item-title {\n  position: relative;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  width: 100%;\n}\n.item-subtitle {\n  font-size: 14px;\n  position: relative;\n  overflow: hidden;\n  white-space: nowrap;\n  max-width: 100%;\n  text-overflow: ellipsis;\n}\n.item-text {\n  font-size: 14px;\n  color: rgba(0, 0, 0, 0.6);\n  line-height: 20px;\n  position: relative;\n  overflow: hidden;\n  max-height: 40px;\n  text-overflow: ellipsis;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  display: -webkit-box;\n}\n.is-desktop .list-item:hover {\n  background-color: rgba(33, 150, 243, 0.11);\n}\n.list-item[is-pressed] {\n  background-color: rgba(0, 0, 0, 0.1) !important;\n}\nui-breadcrumb {\n  list-style: none;\n  display: inline-flex;\n  flex-wrap: nowrap;\n  margin: 11.333333333333334px 0 0;\n  padding: 0;\n}\nui-breadcrumb li {\n  float: left;\n  margin-bottom: 11.333333333333334px;\n}\nui-breadcrumb li:first-child {\n  padding-left: 15px;\n  border-radius: 2px 0 0 2px;\n}\nui-breadcrumb li:last-child {\n  padding-right: 15px;\n  border-radius: 0 2px 2px 0;\n}\nui-breadcrumb li {\n  color: #fff;\n  fill: #fff;\n  background: #2196F3;\n  position: relative;\n  display: flex;\n  align-items: center;\n  text-decoration: none;\n  height: 34px;\n  padding: 0 10px 0 5px;\n  text-align: center;\n  margin-right: 23px;\n}\nui-breadcrumb li:before,\nui-breadcrumb li:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  border: 0 solid transparent;\n  border-width: 17px 10px;\n}\nui-breadcrumb li:after {\n  border-left: solid 17px #2196F3;\n  left: 100%;\n}\nui-breadcrumb li:before {\n  border-color: #2196F3;\n  left: -17px;\n  border-left: solid 17px transparent;\n}\nui-breadcrumb li:first-child:before {\n  border: 0;\n}\nui-breadcrumb li:last-child:after {\n  border: 0;\n}\npage-header {\n  z-index: 10;\n  background: #2196F3;\n  color: #fff;\n  position: absolute;\n  display: flex;\n  justify-content: flex-start;\n  align-items: center;\n  flex-direction: row;\n  left: 0;\n  top: 0;\n  height: 56px;\n  font-size: 20px;\n  width: 100%;\n}\npage-header * {\n  color: #fff !important;\n}\npage-header [action-back],\npage-header [action-drawer] {\n  padding: 0 16px;\n  left: 0px;\n  top: 0;\n  height: 100%;\n}\npage-header svg {\n  fill: #fff;\n}\npage-header-title {\n  padding: 0 20px;\n}\n/* input, ui-textfield */\npage-header ::-webkit-input-placeholder {\n  color: #9acffa;\n}\npage-header input {\n  border-bottom: solid 1px #9acffa !important;\n}\npage-header ui-textfield[ui-element=\"active\"] ::-webkit-input-placeholder {\n  color: #fff;\n}\npage-header ui-textfield[ui-element=\"active\"] input {\n  border-bottom: solid 1px #fff !important;\n}\n.ui-textfield-container svg {\n  fill: #9acffa;\n}\n.ui-textfield-container[set-active=yes] svg {\n  fill: #fff;\n}\nui-progress {\n  display: block;\n  position: relative;\n}\n.ui-progress-c {\n  width: 42px;\n}\n.ui-progress-c:before {\n  content: '';\n  display: block;\n  padding-top: 100%;\n}\n.ui-progress-circular {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  transform-origin: center center;\n  z-index: 1;\n}\n.ui-progress-circular-infinite {\n  animation: rotate 2s linear infinite;\n}\n.ui-progress-circular-path {\n  stroke: #2196F3;\n  stroke-dasharray: 1, 200;\n  stroke-dashoffset: 0;\n  stroke-linecap: round;\n  transition: all 400ms;\n}\n.ui-progress-circular-path-infinite {\n  animation: dash 1.5s ease-in-out infinite;\n}\n.ui-progress-circular-label {\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  right: 3px;\n  bottom: 3px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 10px;\n  border-radius: 50%;\n  background: rgba(0, 0, 0, 0.12);\n}\n@keyframes rotate {\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes dash {\n  0% {\n    stroke-dasharray: 1, 200;\n    stroke-dashoffset: 0;\n  }\n  50% {\n    stroke-dasharray: 89, 200;\n    stroke-dashoffset: -35px;\n  }\n  100% {\n    stroke-dasharray: 89, 200;\n    stroke-dashoffset: -124px;\n  }\n}\n.ui-progress-b {\n  background: #b7ddfb;\n  height: 4px;\n  overflow: hidden;\n  width: 100%;\n}\n.ui-progress-bar {\n  background: #2196F3;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  transform: translate3d(-100%, 0, 0);\n  transition-duration: 150ms;\n}\n.ui-progress-bar-infinite:before {\n  background-color: #2196F3;\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  will-change: left, right;\n  -webkit-animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n  animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n}\n.ui-progress-bar-infinite:after {\n  content: '';\n  position: absolute;\n  background-color: #2196F3;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  will-change: left, right;\n  -webkit-animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n  animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n  -webkit-animation-delay: 1.15s;\n  animation-delay: 1.15s;\n}\n@-webkit-keyframes indeterminate {\n  0% {\n    left: -35%;\n    right: 100%;\n  }\n  60% {\n    left: 100%;\n    right: -90%;\n  }\n  100% {\n    left: 100%;\n    right: -90%;\n  }\n}\n@keyframes indeterminate {\n  0% {\n    left: -35%;\n    right: 100%;\n  }\n  60% {\n    left: 100%;\n    right: -90%;\n  }\n  100% {\n    left: 100%;\n    right: -90%;\n  }\n}\n@-webkit-keyframes indeterminate-short {\n  0% {\n    left: -200%;\n    right: 100%;\n  }\n  60% {\n    left: 107%;\n    right: -8%;\n  }\n  100% {\n    left: 107%;\n    right: -8%;\n  }\n}\n@keyframes indeterminate-short {\n  0% {\n    left: -200%;\n    right: 100%;\n  }\n  60% {\n    left: 107%;\n    right: -8%;\n  }\n  100% {\n    left: 107%;\n    right: -8%;\n  }\n}\nui-button {\n  color: #2196F3;\n  text-decoration: none;\n  text-align: center;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 2px;\n  box-sizing: border-box;\n  padding: 0 10px;\n  margin: 0;\n  height: 36px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  text-transform: uppercase;\n  font-family: inherit;\n  cursor: pointer;\n  min-width: 64px;\n  padding: 0 8px;\n  position: relative;\n  overflow: hidden;\n  outline: 0;\n  border: none;\n  transition-duration: .3s;\n  transform: translate3d(0, 0, 0);\n}\nui-button[is-pressed] {\n  background: rgba(0, 0, 0, 0.1);\n}\nui-button.raised {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\nui-button.raised[is-pressed] {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\nui-button.fill {\n  background: #2196F3;\n  color: #fff;\n  fill: #fff;\n}\nui-button.fill[is-pressed] {\n  background: #0b79d1;\n}\nui-button.fill-accent {\n  background: #FF5252;\n  color: #fff;\n  fill: #fff;\n}\nui-button.fill-accent[is-pressed] {\n  background: #ff0b0b;\n}\nui-button.floating {\n  z-index: 20;\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n  min-width: 32px;\n  width: 56px;\n  height: 56px;\n  line-height: 56px;\n  padding: 0;\n  border-radius: 50%;\n  overflow: hidden;\n}\nui-button.floating[is-pressed] {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.accent-color {\n  color: #FF5252;\n}\nui-checkbox {\n  position: relative;\n}\nui-checkbox input {\n  z-index: 1;\n  position: absolute;\n  margin: 0;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  display: none;\n}\nui-checkbox div {\n  border: 2px solid rgba(0, 0, 0, 0.6);\n  width: 18px;\n  height: 18px;\n  position: relative;\n  border-radius: 2px;\n  box-sizing: border-box;\n  transition-duration: .3s;\n  background: 0 0;\n}\nui-checkbox span {\n  background-color: #2196F3;\n  display: none;\n  border-radius: 4px;\n  margin-left: -2px;\n  margin-top: -2px;\n  height: 18px;\n  width: 18px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20fill%3D'%23ffffff'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M9%2016.17L4.83%2012l-1.42%201.41L9%2019%2021%207l-1.41-1.41z'%2F%3E%3C%2Fsvg%3E\");\n  background-size: 100% auto;\n}\nui-checkbox input:checked + div span {\n  display: block;\n}\nui-drawer {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  width: 1px;\n  display: block;\n  z-index: 30;\n}\nui-drawer .ui-drawer-obfuscator {\n  position: fixed;\n  display: none;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\nui-drawer:not([right]) .ui-drawer-content {\n  left: 0;\n}\nui-drawer[right] .ui-drawer-content {\n  right: 0;\n}\nui-drawer .ui-drawer-content {\n  position: fixed;\n  top: 0;\n  height: 100%;\n  overflow: auto;\n  box-shadow: rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px;\n}\n.ui-drawer-button {\n  display: none;\n}\n/* customizáveis */\n.ui-drawer-content {\n  width: 250px;\n  background-color: #fff;\n}\n.ui-drawer-obfuscator {\n  background: rgba(0, 0, 0, 0.37);\n}\n/* animação do painel */\n.ui-drawer-content {\n  transition: transform 300ms;\n  transform: translate3d(0, 0, 0);\n}\n/* animação do painel alinhado à direita*/\n.ui-drawer-hide[right] .ui-drawer-content {\n  transform: translate3d(100%, 0, 0);\n}\n[action-drawer] {\n  display: none;\n}\n/* comportamento com tela de 780px ou menos */\n@media screen and (max-width: 780px), screen and (orientation: portrait) {\n  /*fecha o painel caso não esteja aberto via javascript */\n  ui-drawer:not([state=\"open\"]) .ui-drawer-content {\n    transform: translate3d(-110%, 0, 0);\n  }\n  ui-drawer[right]:not([state=\"open\"]) .ui-drawer-content {\n    transform: translate3d(100%, 0, 0);\n  }\n  /*oculta o fundo caso não esteja aberto via javascript */\n  ui-drawer:not([state=\"open\"]) .ui-drawer-obfuscator {\n    display: none;\n  }\n  ui-drawer[docked][state=\"open\"] .ui-drawer-obfuscator {\n    display: block;\n    width: 100%;\n  }\n  [action-drawer] {\n    display: initial;\n  }\n}\nui-radio {\n  position: relative;\n}\nui-radio input {\n  position: absolute;\n  margin: 0;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  opacity: 0;\n  display: none;\n}\nui-radio div {\n  border: 2px solid rgba(0, 0, 0, 0.6);\n  width: 20px;\n  height: 20px;\n  position: relative;\n  border-radius: 50%;\n  box-sizing: border-box;\n  transition-duration: .3s;\n  background: 0 0;\n}\nui-radio span {\n  background-color: #2196F3;\n  display: none;\n  border-radius: 50%;\n  margin-left: 3px;\n  margin-top: 3px;\n  height: 10px;\n  width: 10px;\n  background-size: 100% auto;\n}\nui-radio input:checked + div {\n  border-color: #2196F3;\n}\nui-radio input:checked + div span {\n  display: block;\n}\nui-slider {\n  position: relative;\n  width: 100%;\n}\nui-slider label {\n  color: rgba(0, 0, 0, 0.6);\n  display: block;\n  margin-top: 4px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-size: 12px;\n}\nui-slider input {\n  z-index: 1;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  opacity: 0;\n}\nui-slider div {\n  background: rgba(0, 0, 0, 0.35);\n  border-radius: 36px;\n  height: 2px;\n  margin: 11px 2px 11px 1px;\n  padding: 0;\n  border: none;\n  cursor: pointer;\n  position: relative;\n}\nui-slider span {\n  background: #2196F3;\n  position: absolute;\n  height: 20px;\n  width: 20px;\n  top: -9px;\n  left: 0;\n  border-radius: 20px;\n  transition: left .3s;\n}\nui-switch {\n  position: relative;\n}\nui-switch label {\n  display: block;\n  margin-top: 4px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  color: rgba(0, 0, 0, 0.65);\n  font-size: 12px;\n}\nui-switch input {\n  z-index: 1;\n  position: absolute;\n  margin: 0;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n}\nui-switch div {\n  background: #fff;\n  width: 36px;\n  border-radius: 36px;\n  height: 14px;\n  margin: 6px 2px 7px 1px;\n  padding: 0;\n  border: none;\n  cursor: pointer;\n  position: relative;\n  transition-duration: .3s;\n}\nui-switch span {\n  background: #fff;\n  height: 20px;\n  width: 20px;\n  border-radius: 20px;\n  position: absolute;\n  top: -3px;\n  left: 0;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);\n  transform: translateX(0);\n  transition-duration: .3s;\n}\nui-switch input:checked + div {\n  background: #0b79d1;\n}\nui-switch input:checked + div span {\n  transform: translateX(16px);\n  background: #2196F3;\n}\nui-textfield {\n  position: relative;\n}\nui-textfield input {\n  color: #000;\n  border-bottom: solid 1px #e1e1e1;\n  position: relative;\n  background: transparent;\n  border: none;\n  padding: 0;\n  margin: 0;\n  width: 100%;\n  height: 36px;\n  font-size: 16px;\n  font-family: inherit;\n}\nui-textfield label {\n  color: rgba(0, 0, 0, 0.7);\n  display: block;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-size: 12px;\n  margin-top: 7px;\n  width: auto;\n  max-width: 75%;\n}\nui-textfield[ui-element=\"active\"] input {\n  border-bottom: solid 2px #2196F3;\n  transition-duration: .2s;\n}\nui-textfield[ui-element=\"active\"] label {\n  color: #2196F3;\n}\nui-textfield.floating label {\n  transition-duration: .2s;\n  transform-origin: left;\n  transform: scale(1.33333333) translateY(21px);\n}\nui-textfield.floating[ui-element=\"active\"] label {\n  transform: scale(1) translateY(0);\n}\nui-textfield.notnull:not([ui-element=\"active\"]) label {\n  transform: scale(1) translateY(0);\n}\nui-textfield ui-button {\n  position: absolute;\n  top: 12px;\n  height: 24px;\n  min-width: 24px;\n  right: 0;\n  width: 24px;\n  border-radius: 50%;\n}\nui-textfield.focuset ui-button {\n  display: flex!important;\n}\n.ui-textfield-container {\n  align-items: center;\n}\n.ui-textfield-container ui-textfield {\n  margin-left: -24px;\n}\n.ui-textfield-container input {\n  padding-left: 30px;\n}\npage.au-enter-active {\n  z-index: 4;\n  animation: showCenter56ToTop .4s;\n}\npage.au-leave-active {\n  z-index: 2;\n  animation: hideToCenter56 .4s;\n}\n.main-view.au-enter-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\n.main-view.au-leave-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\n.checkbox-buttons .buttons.au-enter-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\n.buttons-checkbox .buttons.au-leave-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\nmodal-view .au-enter-active {\n  z-index: 1;\n  animation: showBottomToTop .4s;\n}\nmodal-view .au-leave-active {\n  z-index: 1;\n  animation: hideToBottom .4s;\n}\n@keyframes noneAnimation {\n  to {\n    opacity: 1;\n  }\n}\n@keyframes moveToLeft {\n  100% {\n    transform: translate3d(-100%, 0, 0);\n  }\n}\n@keyframes moveToRight {\n  100% {\n    transform: translate3d(100%, 0, 0);\n  }\n}\n@keyframes moveLeftToRight {\n  0% {\n    transform: translate3d(-100%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes moveRightToLeft {\n  0% {\n    transform: translate3d(100%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes moveToLeft40 {\n  100% {\n    transform: translate3d(-40%, 0, 0);\n  }\n}\n@keyframes moveLeft40ToRight {\n  0% {\n    transform: translate3d(-40%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes moveLeft40ToRight {\n  0% {\n    transform: translate3d(-40%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes showCenter56ToTop {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 56px, 0);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n@keyframes hideToCenter56 {\n  to {\n    opacity: 0;\n    transform: translate3d(0, 56px, 0);\n  }\n}\n@keyframes showBottomToTop {\n  from {\n    transform: translate3d(0, 100%, 0);\n  }\n  to {\n    transform: translate3d(0, 0, 0);\n  }\n}\n@keyframes hideToBottom {\n  to {\n    transform: translate3d(0, 100%, 0);\n  }\n}\n@keyframes showOverlay {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes hideOverlay {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n"; });
define('text!modules/demo/search/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate search\">\n        <page-header>\n            <ui-button class=\"button-page-header\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </ui-button>\n            <page-header-title style=\"flex:1\">\n                <hbox set-active class=\"ui-textfield-container ui-textfield-clear\">\n                    <icon src=\"icon-search\"></icon>\n                    <ui-textfield value.bind=\"search\" style=\"flex:1\" show-close placeholder=\"Search\"></ui-textfield>\n                </hbox>\n            </page-header-title>\n        </page-header>\n        <page-content class=\"content-block\">\n            <ui-list>\n                <div repeat.for=\"car of cars\" class=\"list-item item-link\">\n                    <div class=\"item-content\">\n                    <span style=\"flex:1;\">${car}</span>\n                    </div>\n                </div>\n            </ui-list>\n        </page-content>\n    </page>\n</template>"; });
define('text!modules/element/ui-button/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate buttons\">\n        <page-header>\n            <button action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </button>\n            <page-header-title style=\"flex:1\">ui-button</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/element/ui-button/index', 'ui-button-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content id=\"ui-button-id\">\n            <div class=\"content-block-title\">Flat Buttons</div>\n            <hbox style=\"justify-content:space-around;\">\n                <ui-button>BUTTON</ui-button>\n                <ui-button class=\"accent-color\">BUTTON</ui-button>\n                <ui-button>BUTTON</ui-button>\n            </hbox>\n\n            <div class=\"content-block-title\">Raised Buttons</div>\n            <hbox style=\"justify-content:space-around;\">\n                <ui-button class=\"raised\">BUTTON</ui-button>\n                <ui-button class=\"raised accent-color\">BUTTON</ui-button>\n                <ui-button class=\"raised\">BUTTON</ui-button>\n            </hbox>\n\n            <div class=\"content-block-title\">Raised Fill Buttons</div>\n            <hbox style=\"justify-content:space-around;\">\n                <ui-button class=\"raised fill\">BUTTON</ui-button>\n                <ui-button class=\"raised fill-accent\">BUTTON</ui-button>\n                <ui-button class=\"raised fill\">BUTTON</ui-button>\n            </hbox>\n\n            <div class=\"content-block-title\">Colors Fills Buttons</div>\n            <hbox style=\"justify-content:space-around;margin-bottom:3px;\">\n                <ui-button class=\"fill color-red\">BUTTON</ui-button>\n                <ui-button class=\"fill fill-accent\">BUTTON</ui-button>\n                <ui-button class=\"fill color-blue\">BUTTON</ui-button>\n            </hbox>\n            \n            <div class=\"content-block-title\">Floating Button</div>\n            <hbox style=\"justify-content:space-around;\">\n                <ui-button class=\"floating fill-accent\"><i class=\"icon icon-plus\"></i></ui-button>\n            </hbox>\n        </page-content>\n    </page>\n</template>"; });
define('text!aurelia-ui/themes/android/_variables.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n"; });
define('text!modules/element/ui-checkbox/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate checkbox\">\n        <page-header>\n            <button class=\"bt-menu\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </button>\n            <page-header-title style=\"flex:1\">ui-checkbox</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/element/ui-checkbox/index', 'ui-checkbox-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content id=\"ui-checkbox-id\" class=\"list ckecboxes-list\">\n            <div class=\"content-block-title\">Checkbox group</div>\n            <list-block>\n                <div class=\"list-item\" action-target=\"ui-checkbox\">\n                    <ui-checkbox checked=\"true\"></ui-checkbox>\n                    <div class=\"item-content\">Books</div>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-checkbox\">\n                    <ui-checkbox checked=\"false\"></ui-checkbox>\n                    <div class=\"item-content\">Movies</div>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-checkbox\">\n                    <ui-checkbox></ui-checkbox>\n                    <div class=\"item-content\">Food</div>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-checkbox\">\n                    <ui-checkbox></ui-checkbox>\n                    <div class=\"item-content\">\n                        Drinks\n                    </div>\n                </div>\n            </list-block>\n        </page-content>\n    </page>\n</template>\n"; });
define('text!modules/element/ui-progress/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate\">\n        <page-header style=\"justify-content:flex-start;\">\n            <ui-button class=\"button-page-header\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </ui-button>\n            <page-header-title style=\"flex:1\">ui-progress</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/css/ui-progress/index', 'ui-progress-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content id=\"ui-progress-id\" class=\"content-block\">\n            <ui-card>\n                <div class=\"ui-card-header\">Determinate Progress Bar</div>\n                <div class=\"ui-card-content\">\n                    <ui-progress percent.bind=\"percent1\"></ui-progress> \n                    <hbox style=\"justify-content:space-around;margin-top:10px;\">\n                        <ui-button class=\"raised\" tap.delegate=\"setPercent(10)\">10%</ui-button>\n                        <ui-button class=\"raised\" tap.delegate=\"setPercent(30)\">30%</ui-button>\n                        <ui-button class=\"raised\" tap.delegate=\"setPercent(50)\">50%</ui-button>\n                        <ui-button class=\"raised\" tap.delegate=\"setPercent(100)\">100%</ui-button>\n                    </hbox>                   \n                </div>\n            </ui-card>\n\n            <ui-card>\n                <div class=\"ui-card-header\">Infinite Progress Bar</div>\n                <div class=\"ui-card-content\">\n                    <ui-progress percent=\"infinite\"></ui-progress>\n                </div>\n            </ui-card>\n\n            <ui-card>\n                <div class=\"ui-card-header\">Progress Circular</div>\n                <div class=\"ui-card-content\">\n                    <hbox style=\"justify-content:space-around;\">\n                        <ui-progress type=\"circle\" percent.bind=\"percent\" style=\"color:brown\"></ui-progress>\n                        <ui-progress type=\"circle\" percent=\"25\" fill=\"#FF9800\" border-width=\"4\"></ui-progress>\n                        <ui-progress type=\"circle\" percent=\"50\" border-color=\"red\"></ui-progress>\n                        <ui-progress type=\"circle\" percent=\"75\" border-width=\"3\"></ui-progress>\n                        <ui-progress type=\"circle\" percent=\"90\" fill=\"transparent\"></ui-progress>\n                    </hbox>\n                </div>\n\n                <div class=\"ui-card-header\">Progress Circular Infinite</div>\n                <div class=\"ui-card-content\">\n                    <ui-progress type=\"circle\" percent=\"infinite\"></ui-progress>                    \n                </div>\n                \n            </ui-card>\n        </page-content>\n    </page>\n</template>"; });
define('text!modules/element/ui-radio/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate checkbox\">\n        <page-header>\n            <button class=\"bt-menu\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </button>\n            <page-header-title style=\"flex:1\">ui-radio</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/element/ui-radio/index', 'ui-radio-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content id=\"ui-radio-id\" class=\"list ckecboxes-list\">\n            <div class=\"content-block-title\">Radio buttons group</div>\n            <list-block>\n                <div class=\"list-item\" action-target=\"ui-radio\">\n                    <ui-radio name=\"group1\" checked=\"true\"></ui-radio>\n                    <div class=\"item-content\">Books</div>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-radio\">\n                    <ui-radio name=\"group1\"></ui-radio>\n                    <div class=\"item-content\">Movies</div>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-radio\">\n                    <ui-radio name=\"group1\"></ui-radio>\n                    <div class=\"item-content\">Food</div>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-radio\">\n                    <ui-radio name=\"group1\"></ui-radio>\n                    <div class=\"item-content\">Drinks</div>\n                </div>\n            </list-block>\n\n            <div class=\"content-block-title\">What is your favourite song?</div>\n            <list-block>\n                <div class=\"list-item\" action-target=\"ui-radio\">\n                    <div class=\"item-media\">\n                        <img src=\"http://lorempixel.com/160/160/fashion/1\" width=\"80\" />\n                    </div>\n                    <div class=\"item-content item-content-multiline\">\n                        <div class=\"item-title hbox\">\n                            <span style=\"flex:1\">Yellow Submarine</span>\n                            <div style=\"color:#757575;font-size:14px;\">R$15,00</div>\n                        </div>\n                        <div class=\"item-subtitle\">Beatles</div>\n                        <div class=\"item-text\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sagittis tellus ut turpis condimentum, ut dignissim lacus tincidunt. Cras dolor metus, ultrices condimentum sodales sit amet, pharetra sodales eros. Phasellus vel felis tellus. Mauris rutrum ligula nec dapibus feugiat. In vel dui laoreet, commodo augue id, pulvinar lacus.</div>\n                    </div>\n                    <ui-radio name=\"group2\" checked=\"true\" style=\"margin-right:20px;\"></ui-radio>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-radio\">\n                    <div class=\"item-media\">\n                        <img src=\"http://lorempixel.com/160/160/fashion/2\" width=\"80\" />\n                    </div>\n                    <div class=\"item-content item-content-multiline\">\n                        <div class=\"item-title hbox\">\n                            <span style=\"flex:1\">Don't Stop Me Now</span>\n                            <div style=\"color:#757575;font-size:14px;\">R$22,00</div>\n                        </div>\n                        <div class=\"item-subtitle\">Queen</div>\n                        <div class=\"item-text\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sagittis tellus ut turpis condimentum, ut dignissim lacus tincidunt. Cras dolor metus, ultrices condimentum sodales sit amet, pharetra sodales eros. Phasellus vel felis tellus. Mauris rutrum ligula nec dapibus feugiat. In vel dui laoreet, commodo augue id, pulvinar lacus.</div>\n                    </div>\n                    <ui-radio name=\"group2\" style=\"margin-right:20px;\"></ui-radio>\n                </div>\n                <div class=\"list-item\" action-target=\"ui-radio\">\n                    <div class=\"item-media\">\n                        <img src=\"http://lorempixel.com/160/160/fashion/3\" width=\"80\" />\n                    </div>\n                    <div class=\"item-content item-content-multiline\">\n                        <div class=\"item-title hbox\">\n                            <span style=\"flex:1\">Billie Jean</span>\n                            <div style=\"color:#757575;font-size:14px;\">R$16,00</div>\n                        </div>\n                        <div class=\"item-subtitle\">Michael Jackson</div>\n                        <div class=\"item-text\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sagittis tellus ut turpis condimentum, ut dignissim lacus tincidunt. Cras dolor metus, ultrices condimentum sodales sit amet, pharetra sodales eros. Phasellus vel felis tellus. Mauris rutrum ligula nec dapibus feugiat. In vel dui laoreet, commodo augue id, pulvinar lacus.</div>\n                    </div>\n                    <ui-radio name=\"group2\" style=\"margin-right:20px;\"></ui-radio>\n                </div>\n            </list-block>\n        </page-content>\n    </page>\n</template>\n"; });
define('text!modules/element/ui-textfield/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate view-textfield\">\n        <page-header>\n            <button class=\"bt-menu\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </button>\n            <page-header-title style=\"flex:1\">ui-textfield</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/element/ui-textfield/index', 'ui-textfield-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content id=\"ui-textfield-id\">\n            <div class=\"content-block-title\">Simple Textfield</div>\n            <div class=\"content-block\">\n                <ui-textfield label=\"Name\" placeholder=\"Your name\"></ui-textfield>\n                <ui-textfield label=\"Bird date\" type=\"date\"></ui-textfield>\n            </div>\n            <div class=\"content-block-title\">Textfield With Floating Labels</div>\n            <div class=\"content-block\">\n                <ui-textfield class=\"floating\" placeholder=\"Your name\"></ui-textfield>\n                <ui-textfield class=\"floating\" placeholder=\"E-mail\"></ui-textfield>\n            </div>\n        </page-content>\n    </page>\n</template>\n"; });
define('text!aurelia-ui/themes/android/ui-alert.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n.modal {\n  z-index: 50;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.modal-overlay {\n  background: rgba(0, 0, 0, 0.4);\n}\n.modal-alert {\n  color: #000;\n  background: #fff;\n  min-width: 260px;\n  border-radius: 3px;\n  font-size: 16px;\n  padding: 24px 24px 2px 20px;\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n.modal-alert-title {\n  color: #000;\n  font-weight: 500;\n  font-size: 20px;\n  line-height: 1.3;\n}\n.modal-alert-text {\n  line-height: 1.5;\n}\n.modal-alert-title + .modal-alert-text {\n  margin-top: 20px;\n}\n.modal-alert-buttons {\n  justify-content: flex-end;\n  height: 48px;\n  padding: 6px 8px;\n  margin: 14px -24px 0 -20px;\n  overflow: hidden;\n}\n/* força usar 3D */\n.modal-overlay,\n.modal-alert {\n  transform: translate3d(0, 0, 0);\n}\n/* efeitos de entrada e saída do overlay */\n.modal-overlay.au-enter-active {\n  animation: overlayShow .4s;\n}\n.modal-overlay.au-leave-active {\n  animation: overlayHide .4s;\n}\n/* efeitos de entrada e saída do alert */\n.modal-overlay.au-enter-active .modal-alert {\n  animation: alertShow .4s;\n}\n.modal-overlay.au-leave-active .modal-alert {\n  animation: alertHide .4s;\n}\n@keyframes overlayShow {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@keyframes overlayHide {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes alertShow {\n  0% {\n    opacity: 0;\n    transform: scale(1.185);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n@keyframes alertHide {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(0.8);\n  }\n}\n"; });
define('text!modules/element/ui-slider/index.html', ['module'], function(module) { module.exports = "<template>\n    <page class=\"au-animate view-slider\">\n        <page-header>\n            <button class=\"bt-menu\" action-drawer=\"drawer1\">\n                <icon src=\"icon-menu\"></icon>\n            </button>\n            <page-header-title style=\"flex:1\">ui-slider</page-header-title>\n            <ui-button class=\"button-page-header\" title=\"view source\" tap.delegate=\"onViewCodeTap('modules/element/ui-slider/index', 'ui-slider-id')\">\n                <icon src=\"icon-code\"></icon>\n            </ui-button>\n        </page-header>\n        <page-content id=\"ui-slider-id\">\n            <div class=\"content-block-title\">Simple Slider</div>\n            <div class=\"content-block\">\n                <ui-slider label=\"Slider\"></ui-slider>\n            </div>\n        </page-content>\n    </page>\n</template>\n"; });
define('text!aurelia-ui/themes/android/ui-animate.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\npage.au-enter-active {\n  z-index: 4;\n  animation: showCenter56ToTop .4s;\n}\npage.au-leave-active {\n  z-index: 2;\n  animation: hideToCenter56 .4s;\n}\n.main-view.au-enter-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\n.main-view.au-leave-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\n.checkbox-buttons .buttons.au-enter-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\n.buttons-checkbox .buttons.au-leave-active {\n  z-index: 1;\n  animation: noneAnimation .4s;\n}\nmodal-view .au-enter-active {\n  z-index: 1;\n  animation: showBottomToTop .4s;\n}\nmodal-view .au-leave-active {\n  z-index: 1;\n  animation: hideToBottom .4s;\n}\n@keyframes noneAnimation {\n  to {\n    opacity: 1;\n  }\n}\n@keyframes moveToLeft {\n  100% {\n    transform: translate3d(-100%, 0, 0);\n  }\n}\n@keyframes moveToRight {\n  100% {\n    transform: translate3d(100%, 0, 0);\n  }\n}\n@keyframes moveLeftToRight {\n  0% {\n    transform: translate3d(-100%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes moveRightToLeft {\n  0% {\n    transform: translate3d(100%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes moveToLeft40 {\n  100% {\n    transform: translate3d(-40%, 0, 0);\n  }\n}\n@keyframes moveLeft40ToRight {\n  0% {\n    transform: translate3d(-40%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes moveLeft40ToRight {\n  0% {\n    transform: translate3d(-40%, 0, 0);\n  }\n  100% {\n    transform: none;\n  }\n}\n@keyframes showCenter56ToTop {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 56px, 0);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n@keyframes hideToCenter56 {\n  to {\n    opacity: 0;\n    transform: translate3d(0, 56px, 0);\n  }\n}\n@keyframes showBottomToTop {\n  from {\n    transform: translate3d(0, 100%, 0);\n  }\n  to {\n    transform: translate3d(0, 0, 0);\n  }\n}\n@keyframes hideToBottom {\n  to {\n    transform: translate3d(0, 100%, 0);\n  }\n}\n@keyframes showOverlay {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes hideOverlay {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n"; });
define('text!aurelia-ui/themes/android/ui-breadcrumb.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-breadcrumb {\n  list-style: none;\n  display: inline-flex;\n  flex-wrap: nowrap;\n  margin: 11.333333333333334px 0 0;\n  padding: 0;\n}\nui-breadcrumb li {\n  float: left;\n  margin-bottom: 11.333333333333334px;\n}\nui-breadcrumb li:first-child {\n  padding-left: 15px;\n  border-radius: 2px 0 0 2px;\n}\nui-breadcrumb li:last-child {\n  padding-right: 15px;\n  border-radius: 0 2px 2px 0;\n}\nui-breadcrumb li {\n  color: #fff;\n  fill: #fff;\n  background: #2196F3;\n  position: relative;\n  display: flex;\n  align-items: center;\n  text-decoration: none;\n  height: 34px;\n  padding: 0 10px 0 5px;\n  text-align: center;\n  margin-right: 23px;\n}\nui-breadcrumb li:before,\nui-breadcrumb li:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  border: 0 solid transparent;\n  border-width: 17px 10px;\n}\nui-breadcrumb li:after {\n  border-left: solid 17px #2196F3;\n  left: 100%;\n}\nui-breadcrumb li:before {\n  border-color: #2196F3;\n  left: -17px;\n  border-left: solid 17px transparent;\n}\nui-breadcrumb li:first-child:before {\n  border: 0;\n}\nui-breadcrumb li:last-child:after {\n  border: 0;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-button.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-button {\n  color: #2196F3;\n  text-decoration: none;\n  text-align: center;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 2px;\n  box-sizing: border-box;\n  padding: 0 10px;\n  margin: 0;\n  height: 36px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  text-transform: uppercase;\n  font-family: inherit;\n  cursor: pointer;\n  min-width: 64px;\n  padding: 0 8px;\n  position: relative;\n  overflow: hidden;\n  outline: 0;\n  border: none;\n  transition-duration: .3s;\n  transform: translate3d(0, 0, 0);\n}\nui-button[is-pressed] {\n  background: rgba(0, 0, 0, 0.1);\n}\nui-button.raised {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\nui-button.raised[is-pressed] {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\nui-button.fill {\n  background: #2196F3;\n  color: #fff;\n  fill: #fff;\n}\nui-button.fill[is-pressed] {\n  background: #0b79d1;\n}\nui-button.fill-accent {\n  background: #FF5252;\n  color: #fff;\n  fill: #fff;\n}\nui-button.fill-accent[is-pressed] {\n  background: #ff0b0b;\n}\nui-button.floating {\n  z-index: 20;\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n  min-width: 32px;\n  width: 56px;\n  height: 56px;\n  line-height: 56px;\n  padding: 0;\n  border-radius: 50%;\n  overflow: hidden;\n}\nui-button.floating[is-pressed] {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.accent-color {\n  color: #FF5252;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-card.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-card,\n.ui-card {\n  background: #fff;\n  display: block;\n  margin: 8px;\n  position: relative;\n  border-radius: 2px;\n  font-size: 14px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.ui-card-content {\n  position: relative;\n  padding: 16px;\n}\n.ui-card-header,\n.ui-card-footer {\n  min-height: 48px;\n  position: relative;\n  padding: 4px 16px;\n  box-sizing: border-box;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.ui-card-header {\n  border-radius: 2px 2px 0 0;\n  font-size: 16px;\n}\n.ui-card-footer {\n  color: rgba(0, 0, 0, 0.7);\n  border-radius: 0 0 2px 2px;\n}\n.ui-card-image {\n  color: #fff;\n  height: 190px;\n  align-items: flex-end;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-checkbox.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-checkbox {\n  position: relative;\n}\nui-checkbox input {\n  z-index: 1;\n  position: absolute;\n  margin: 0;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  display: none;\n}\nui-checkbox div {\n  border: 2px solid rgba(0, 0, 0, 0.6);\n  width: 18px;\n  height: 18px;\n  position: relative;\n  border-radius: 2px;\n  box-sizing: border-box;\n  transition-duration: .3s;\n  background: 0 0;\n}\nui-checkbox span {\n  background-color: #2196F3;\n  display: none;\n  border-radius: 4px;\n  margin-left: -2px;\n  margin-top: -2px;\n  height: 18px;\n  width: 18px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20fill%3D'%23ffffff'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M9%2016.17L4.83%2012l-1.42%201.41L9%2019%2021%207l-1.41-1.41z'%2F%3E%3C%2Fsvg%3E\");\n  background-size: 100% auto;\n}\nui-checkbox input:checked + div span {\n  display: block;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-component.css', ['module'], function(module) { module.exports = "* {\n  -webkit-tap-highlight-color: transparent;\n  -webkit-touch-callout: none;\n  box-sizing: border-box;\n}\nbody {\n  font-family: Roboto, Noto, Helvetica, Arial, sans-serif;\n  margin: 0;\n  padding: 0;\n  fill: #757575;\n  color: #212121;\n  font-size: 14px;\n  line-height: 1.5;\n  width: 100%;\n  -webkit-text-size-adjust: 100%;\n  background: #fff;\n  overflow: hidden;\n}\n[ui-element] {\n  -webkit-user-select: none;\n  user-select: none;\n  display: block;\n}\n.content-block-title {\n  position: relative;\n  overflow: hidden;\n  margin: 0;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  line-height: 1;\n  margin: 16px 16px 16px;\n  padding-top: 16px;\n  line-height: 16px;\n  font-weight: bold;\n  color: rgba(45, 45, 45, 0.54);\n}\n"; });
define('text!aurelia-ui/themes/android/ui-drawer.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-drawer {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  width: 1px;\n  display: block;\n  z-index: 30;\n}\nui-drawer .ui-drawer-obfuscator {\n  position: fixed;\n  display: none;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\nui-drawer:not([right]) .ui-drawer-content {\n  left: 0;\n}\nui-drawer[right] .ui-drawer-content {\n  right: 0;\n}\nui-drawer .ui-drawer-content {\n  position: fixed;\n  top: 0;\n  height: 100%;\n  overflow: auto;\n  box-shadow: rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px;\n}\n.ui-drawer-button {\n  display: none;\n}\n/* customizáveis */\n.ui-drawer-content {\n  width: 250px;\n  background-color: #fff;\n}\n.ui-drawer-obfuscator {\n  background: rgba(0, 0, 0, 0.37);\n}\n/* animação do painel */\n.ui-drawer-content {\n  transition: transform 300ms;\n  transform: translate3d(0, 0, 0);\n}\n/* animação do painel alinhado à direita*/\n.ui-drawer-hide[right] .ui-drawer-content {\n  transform: translate3d(100%, 0, 0);\n}\n[action-drawer] {\n  display: none;\n}\n/* comportamento com tela de 780px ou menos */\n@media screen and (max-width: 780px), screen and (orientation: portrait) {\n  /*fecha o painel caso não esteja aberto via javascript */\n  ui-drawer:not([state=\"open\"]) .ui-drawer-content {\n    transform: translate3d(-110%, 0, 0);\n  }\n  ui-drawer[right]:not([state=\"open\"]) .ui-drawer-content {\n    transform: translate3d(100%, 0, 0);\n  }\n  /*oculta o fundo caso não esteja aberto via javascript */\n  ui-drawer:not([state=\"open\"]) .ui-drawer-obfuscator {\n    display: none;\n  }\n  ui-drawer[docked][state=\"open\"] .ui-drawer-obfuscator {\n    display: block;\n    width: 100%;\n  }\n  [action-drawer] {\n    display: initial;\n  }\n}\n"; });
define('text!aurelia-ui/themes/android/ui-header.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\npage-header {\n  z-index: 10;\n  background: #2196F3;\n  color: #fff;\n  position: absolute;\n  display: flex;\n  justify-content: flex-start;\n  align-items: center;\n  flex-direction: row;\n  left: 0;\n  top: 0;\n  height: 56px;\n  font-size: 20px;\n  width: 100%;\n}\npage-header * {\n  color: #fff !important;\n}\npage-header [action-back],\npage-header [action-drawer] {\n  padding: 0 16px;\n  left: 0px;\n  top: 0;\n  height: 100%;\n}\npage-header svg {\n  fill: #fff;\n}\npage-header-title {\n  padding: 0 20px;\n}\n/* input, ui-textfield */\npage-header ::-webkit-input-placeholder {\n  color: #9acffa;\n}\npage-header input {\n  border-bottom: solid 1px #9acffa !important;\n}\npage-header ui-textfield[ui-element=\"active\"] ::-webkit-input-placeholder {\n  color: #fff;\n}\npage-header ui-textfield[ui-element=\"active\"] input {\n  border-bottom: solid 1px #fff !important;\n}\n.ui-textfield-container svg {\n  fill: #9acffa;\n}\n.ui-textfield-container[set-active=yes] svg {\n  fill: #fff;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-icons.css', ['module'], function(module) { module.exports = "i.icon {\n  display: inline-block;\n  vertical-align: middle;\n  background-size: 100% auto;\n  background-position: center;\n  background-repeat: no-repeat;\n  font-style: normal;\n  position: relative;\n}\ni.icon.icon-back {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M20%2011H7.83l5.59-5.59L12%204l-8%208%208%208%201.41-1.41L7.83%2013H20v-2z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-forward {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M12%204l-1.41%201.41L16.17%2011H4v2h12.17l-5.58%205.59L12%2020l8-8z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-bars {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M3%2018h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-camera {\n  width: 24px;\n  height: 24px;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D'%23333'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%20width%3D'24'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Ccircle%20cx%3D'12'%20cy%3D'12'%20r%3D'3.2'%2F%3E%3Cpath%20d%3D'M9%202L7.17%204H4c-1.1%200-2%20.9-2%202v12c0%201.1.9%202%202%202h16c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2h-3.17L15%202H9zm3%2015c-2.76%200-5-2.24-5-5s2.24-5%205-5%205%202.24%205%205-2.24%205-5%205z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-next {\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20fill%3D'%23ffffff'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M10%206L8.59%207.41%2013.17%2012l-4.58%204.59L10%2018l6-6z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-prev {\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20fill%3D'%23ffffff'%20width%3D'24'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%3E%3Cpath%20d%3D'M15.41%207.41L14%206l-6%206%206%206%201.41-1.41L10.83%2012z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-plus {\n  width: 24px;\n  height: 24px;\n  font-size: 0;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D'%23FFFFFF'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%20width%3D'24'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'M19%2013h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\ni.icon.icon-close {\n  width: 24px;\n  height: 24px;\n  font-size: 0;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20fill%3D'%23FFFFFF'%20height%3D'24'%20viewBox%3D'0%200%2024%2024'%20width%3D'24'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z'%2F%3E%3Cpath%20d%3D'M0%200h24v24H0z'%20fill%3D'none'%2F%3E%3C%2Fsvg%3E\");\n}\n"; });
define('text!aurelia-ui/themes/android/ui-layout.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n/* layout manager */\nhbox,\n.hbox {\n  display: flex;\n  justify-content: flex-start;\n  align-items: stretch;\n  flex-direction: row;\n}\nvbox,\n.vbox {\n  display: flex;\n  justify-content: flex-start;\n  align-items: stretch;\n  flex-direction: column;\n}\nclient,\n.client {\n  flex: 1;\n  position: relative;\n}\nvbox[layout=\"start\"],\nhbox[layout=\"start\"],\n.vbox[layout=\"start\"],\n.hbox[layout=\"start\"] {\n  justify-content: flex-start;\n}\nvbox[layout=\"center\"],\nhbox[layout=\"center\"],\n.vbox[layout=\"center\"],\n.hbox[layout=\"center\"] {\n  justify-content: center;\n}\nvbox[layout=\"end\"],\nhbox[layout=\"end\"],\n.vbox[layout=\"end\"],\n.hbox[layout=\"end\"] {\n  justify-content: flex-end;\n}\nvbox[layout=\"space-around\"],\nhbox[layout=\"space-around\"],\n.vbox[layout=\"space-around\"],\n.hbox[layout=\"space-around\"] {\n  justify-content: space-around;\n}\nvbox[layout=\"space-between\"],\nhbox[layout=\"space-between\"],\n.vbox[layout=\"space-between\"],\n.hbox[layout=\"space-between\"] {\n  justify-content: space-between;\n}\nvbox[layout=\"center center\"],\nhbox[layout=\"center\"],\n.vbox[layout=\"center center\"],\n.hbox[layout=\"center\"] {\n  justify-content: center;\n  align-items: center;\n}\n.spacer {\n  flex-grow: 1;\n}\n.full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n/* icon */\nicon {\n  display: block;\n  position: relative;\n}\nicon svg {\n  fill: inherit;\n}\n/* native elements */\n* {\n  outline: 0;\n}\na {\n  color: inherit;\n  text-decoration: none;\n}\nbutton {\n  transition-duration: .3s;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n}\nbutton[is-pressed] {\n  background: rgba(0, 0, 0, 0.1);\n}\n/* page element */\npage {\n  background: #fff;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\npage {\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\npage-content {\n  position: absolute;\n  overflow: auto;\n  left: 0;\n  width: 100%;\n  top: 56px;\n  bottom: 0;\n  padding-bottom: 20px;\n}\n.button-page-header {\n  padding: 0 16px;\n  height: 100%;\n}\n.page-container {\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.content-block {\n  margin: 32px 0;\n  padding: 0 16px;\n}\n.popup-overlay {\n  z-index: 60;\n  display: block;\n  position: fixed;\n  top: 0;\n  left: 0;\n  background: rgba(0, 0, 0, 0.4);\n}\n.popup-overlay page {\n  position: fixed;\n}\nmodal-view {\n  z-index: 40;\n  position: fixed;\n  top: 0;\n  left: 0;\n}\nmodal-view page {\n  position: fixed;\n}\n/* comportamento com tela de 780px ou mais */\n@media screen and (min-width: 780px) and (orientation: landscape) {\n  compose.modal-activate {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(123, 123, 123, 0.4);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n  compose.modal-activate page {\n    position: relative;\n    min-width: 500px;\n    min-height: 400px;\n    width: initial;\n    height: initial;\n    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n  }\n}\n"; });
define('text!aurelia-ui/themes/android/ui-list.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\n/* list element */\nui-list,\n.ui-list {\n  border-color: #e1e1e1;\n  overflow: auto;\n  display: block;\n  border-top-style: solid;\n  border-width: 1px;\n}\nui-list-block,\n.ui-list-block {\n  border-top: solid 1px #e1e1e1;\n  display: block;\n  margin: 32px 0;\n  font-size: 16px;\n}\nui-list-item,\nlist-item,\n.ui-list-item,\n.list-item {\n  display: flex;\n  position: relative;\n  padding-left: 16px;\n  min-height: 48px;\n  align-items: center;\n  transition-property: background;\n  transition-duration: .3s;\n  cursor: pointer;\n}\nui-list-item icon,\n.ui-list-item icon {\n  width: 24px;\n  height: 24px;\n}\nui-list-item,\n.ui-list-item[is-pressed] {\n  background-color: rgba(0, 0, 0, 0.1) !important;\n}\n.list-title {\n  background: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.7);\n  padding: 0 16px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  height: 48px;\n  line-height: 48px;\n  font-size: 14px;\n}\n.item-link {\n  background-size: 10px 20px;\n  background-repeat: no-repeat;\n  background-position: 95% center;\n  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%2060%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'm60%2061.5-38.25%2038.25-9.75-9.75%2029.25-28.5-29.25-28.5%209.75-9.75z'%20fill%3D'%23c7c7cc'%2F%3E%3C%2Fsvg%3E\");\n}\n.item-media {\n  height: 100%;\n  width: 40px;\n  margin-right: 12px;\n  display: flex;\n  align-items: center;\n}\n.item-media img {\n  width: auto;\n  height: auto;\n  max-width: 40px;\n  border-radius: 50%;\n}\n.item-content {\n  border-bottom: solid 1px #e1e1e1;\n  display: flex;\n  width: 100%;\n  min-height: 48px;\n  align-items: center;\n  margin-right: 8px;\n}\n.item-left {\n  margin-right: 22px;\n}\n.item-content-multiline {\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 8px 0;\n}\n.item-title {\n  position: relative;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  width: 100%;\n}\n.item-subtitle {\n  font-size: 14px;\n  position: relative;\n  overflow: hidden;\n  white-space: nowrap;\n  max-width: 100%;\n  text-overflow: ellipsis;\n}\n.item-text {\n  font-size: 14px;\n  color: rgba(0, 0, 0, 0.6);\n  line-height: 20px;\n  position: relative;\n  overflow: hidden;\n  max-height: 40px;\n  text-overflow: ellipsis;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  display: -webkit-box;\n}\n.is-desktop .list-item:hover {\n  background-color: rgba(33, 150, 243, 0.11);\n}\n.list-item[is-pressed] {\n  background-color: rgba(0, 0, 0, 0.1) !important;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-progress.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-progress {\n  display: block;\n  position: relative;\n}\n.ui-progress-c {\n  width: 42px;\n}\n.ui-progress-c:before {\n  content: '';\n  display: block;\n  padding-top: 100%;\n}\n.ui-progress-circular {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  transform-origin: center center;\n  z-index: 1;\n}\n.ui-progress-circular-infinite {\n  animation: rotate 2s linear infinite;\n}\n.ui-progress-circular-path {\n  stroke: #2196F3;\n  stroke-dasharray: 1, 200;\n  stroke-dashoffset: 0;\n  stroke-linecap: round;\n  transition: all 400ms;\n}\n.ui-progress-circular-path-infinite {\n  animation: dash 1.5s ease-in-out infinite;\n}\n.ui-progress-circular-label {\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  right: 3px;\n  bottom: 3px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 10px;\n  border-radius: 50%;\n  background: rgba(0, 0, 0, 0.12);\n}\n@keyframes rotate {\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes dash {\n  0% {\n    stroke-dasharray: 1, 200;\n    stroke-dashoffset: 0;\n  }\n  50% {\n    stroke-dasharray: 89, 200;\n    stroke-dashoffset: -35px;\n  }\n  100% {\n    stroke-dasharray: 89, 200;\n    stroke-dashoffset: -124px;\n  }\n}\n.ui-progress-b {\n  background: #b7ddfb;\n  height: 4px;\n  overflow: hidden;\n  width: 100%;\n}\n.ui-progress-bar {\n  background: #2196F3;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n  transform: translate3d(-100%, 0, 0);\n  transition-duration: 150ms;\n}\n.ui-progress-bar-infinite:before {\n  background-color: #2196F3;\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  will-change: left, right;\n  -webkit-animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n  animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n}\n.ui-progress-bar-infinite:after {\n  content: '';\n  position: absolute;\n  background-color: #2196F3;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  will-change: left, right;\n  -webkit-animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n  animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n  -webkit-animation-delay: 1.15s;\n  animation-delay: 1.15s;\n}\n@-webkit-keyframes indeterminate {\n  0% {\n    left: -35%;\n    right: 100%;\n  }\n  60% {\n    left: 100%;\n    right: -90%;\n  }\n  100% {\n    left: 100%;\n    right: -90%;\n  }\n}\n@keyframes indeterminate {\n  0% {\n    left: -35%;\n    right: 100%;\n  }\n  60% {\n    left: 100%;\n    right: -90%;\n  }\n  100% {\n    left: 100%;\n    right: -90%;\n  }\n}\n@-webkit-keyframes indeterminate-short {\n  0% {\n    left: -200%;\n    right: 100%;\n  }\n  60% {\n    left: 107%;\n    right: -8%;\n  }\n  100% {\n    left: 107%;\n    right: -8%;\n  }\n}\n@keyframes indeterminate-short {\n  0% {\n    left: -200%;\n    right: 100%;\n  }\n  60% {\n    left: 107%;\n    right: -8%;\n  }\n  100% {\n    left: 107%;\n    right: -8%;\n  }\n}\n"; });
define('text!aurelia-ui/themes/android/ui-radio.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-radio {\n  position: relative;\n}\nui-radio input {\n  position: absolute;\n  margin: 0;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  opacity: 0;\n  display: none;\n}\nui-radio div {\n  border: 2px solid rgba(0, 0, 0, 0.6);\n  width: 20px;\n  height: 20px;\n  position: relative;\n  border-radius: 50%;\n  box-sizing: border-box;\n  transition-duration: .3s;\n  background: 0 0;\n}\nui-radio span {\n  background-color: #2196F3;\n  display: none;\n  border-radius: 50%;\n  margin-left: 3px;\n  margin-top: 3px;\n  height: 10px;\n  width: 10px;\n  background-size: 100% auto;\n}\nui-radio input:checked + div {\n  border-color: #2196F3;\n}\nui-radio input:checked + div span {\n  display: block;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-slider.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-slider {\n  position: relative;\n  width: 100%;\n}\nui-slider label {\n  color: rgba(0, 0, 0, 0.6);\n  display: block;\n  margin-top: 4px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-size: 12px;\n}\nui-slider input {\n  z-index: 1;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  opacity: 0;\n}\nui-slider div {\n  background: rgba(0, 0, 0, 0.35);\n  border-radius: 36px;\n  height: 2px;\n  margin: 11px 2px 11px 1px;\n  padding: 0;\n  border: none;\n  cursor: pointer;\n  position: relative;\n}\nui-slider span {\n  background: #2196F3;\n  position: absolute;\n  height: 20px;\n  width: 20px;\n  top: -9px;\n  left: 0;\n  border-radius: 20px;\n  transition: left .3s;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-switch.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-switch {\n  position: relative;\n}\nui-switch label {\n  display: block;\n  margin-top: 4px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  color: rgba(0, 0, 0, 0.65);\n  font-size: 12px;\n}\nui-switch input {\n  z-index: 1;\n  position: absolute;\n  margin: 0;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n}\nui-switch div {\n  background: #fff;\n  width: 36px;\n  border-radius: 36px;\n  height: 14px;\n  margin: 6px 2px 7px 1px;\n  padding: 0;\n  border: none;\n  cursor: pointer;\n  position: relative;\n  transition-duration: .3s;\n}\nui-switch span {\n  background: #fff;\n  height: 20px;\n  width: 20px;\n  border-radius: 20px;\n  position: absolute;\n  top: -3px;\n  left: 0;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);\n  transform: translateX(0);\n  transition-duration: .3s;\n}\nui-switch input:checked + div {\n  background: #0b79d1;\n}\nui-switch input:checked + div span {\n  transform: translateX(16px);\n  background: #2196F3;\n}\n"; });
define('text!aurelia-ui/themes/android/ui-textfield.css', ['module'], function(module) { module.exports = ".absolute-full {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n.absolute-full-percent {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n/*\nShadow Elevation\nMaterial Design Especification\nElevation (dp)    | Component\n------------------+------------\n24                  Dialog\n                    Picker\n16                  Nav drawer\n                    Right drawer\n                    Modal bottom Sheet\n12                  Floating action button (FAB - pressed)\n9                   Sub menu (+1dp for each sub menu)\n8                   Bottom navigation bar\n                    Menu\n                    Card (when picked up)\n                    Raised button (pressed state)\n6                   Floating action button (FAB - resting elevation)\n                    Snackbar\n4                   App Bar\n3                   Refresh indicator\n                    Quick entry / Search bar (scrolled state)\n2                   Card (resting elevation) *\n                    Raised button (resting elevation)*\n                    Quick entry / Search bar (resting elevation)\n1                   Switch\n*/\n.shadow-1 {\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.shadow-2 {\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-3 {\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);\n}\n.shadow-4 {\n  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);\n}\n.shadow-5 {\n  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);\n}\nui-textfield {\n  position: relative;\n}\nui-textfield input {\n  color: #000;\n  border-bottom: solid 1px #e1e1e1;\n  position: relative;\n  background: transparent;\n  border: none;\n  padding: 0;\n  margin: 0;\n  width: 100%;\n  height: 36px;\n  font-size: 16px;\n  font-family: inherit;\n}\nui-textfield label {\n  color: rgba(0, 0, 0, 0.7);\n  display: block;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-size: 12px;\n  margin-top: 7px;\n  width: auto;\n  max-width: 75%;\n}\nui-textfield[ui-element=\"active\"] input {\n  border-bottom: solid 2px #2196F3;\n  transition-duration: .2s;\n}\nui-textfield[ui-element=\"active\"] label {\n  color: #2196F3;\n}\nui-textfield.floating label {\n  transition-duration: .2s;\n  transform-origin: left;\n  transform: scale(1.33333333) translateY(21px);\n}\nui-textfield.floating[ui-element=\"active\"] label {\n  transform: scale(1) translateY(0);\n}\nui-textfield.notnull:not([ui-element=\"active\"]) label {\n  transform: scale(1) translateY(0);\n}\nui-textfield ui-button {\n  position: absolute;\n  top: 12px;\n  height: 24px;\n  min-width: 24px;\n  right: 0;\n  width: 24px;\n  border-radius: 50%;\n}\nui-textfield.focuset ui-button {\n  display: flex!important;\n}\n.ui-textfield-container {\n  align-items: center;\n}\n.ui-textfield-container ui-textfield {\n  margin-left: -24px;\n}\n.ui-textfield-container input {\n  padding-left: 30px;\n}\n"; });
define('text!aurelia-ui/themes/ios/index.css', ['module'], function(module) { module.exports = ""; });
//# sourceMappingURL=app-bundle.js.map