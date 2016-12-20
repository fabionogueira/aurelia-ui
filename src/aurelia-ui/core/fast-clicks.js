/*==================================================================================
************   Fast Clicks   ************
************   Inspired by https://github.com/nolimits4web/Framework7   ************
==================================================================================*/

/*===============================================================================
************   Fast Clicks   ************
************   Inspired by https://github.com/ftlabs/fastclick   ************
===============================================================================*/

import device from './device';
import dispatcher from './dispatcher';

let initFastClicks = function () {
    
    if (device.ios && device.webView) {
        // Strange hack required for iOS 8 webview to work on inputs
        window.addEventListener('touchstart', function () {});
    }

    var touchStartX, touchStartY, touchStartTime, targetElement, trackClick, activeSelection, scrollParent, lastClickTime, isMoved, tapHoldFired, tapHoldTimeout;
    var activableElement, activeTimeout, needsFastClick, needsFastClickTimeOut;
    var rippleWave, rippleTarget, rippleTransform, rippleTimeout;

    const HIGHLIGTH_START_EVENT = 'highlightStart';
    const HIGHLIGTH_END_EVENT = 'highlightEnd';
    const LONG_TAP_EVENT = 'longTap';
    
    function isInsideScrollableView(el) {
        let scrollableElement;

        while (el!=body.parentNode){
            if (el.getAttribute('scrollable')){
                scrollableElement = el;
                break;
            }
            el = el.parentNode;
        }

        if (!scrollableElement) return false;

        // This event handler covers the "tap to stop scrolling".
        initScrollHandle(scrollableElement);

        return true;
    }
    function initScrollHandle(scrollableElement){
        if (scrollableElement.scrollHandlerSet) {
            scrollableElement.scrollHandlerSet = true;
            scrollableElement.onscroll = e =>{
                clearTimeout(activeTimeout);
                clearTimeout(rippleTimeout);
            };
        }

    }
    function isFormElement(el) {
        var nodes = ('input select textarea label').split(' ');
        if (el.nodeName && nodes.indexOf(el.nodeName.toLowerCase()) >= 0) return true;
        return false;
    }
    function androidNeedsBlur(el) {
        var noBlur = ('button input textarea select').split(' ');
        if (document.activeElement && el !== document.activeElement && document.activeElement !== document.body) {
            if (noBlur.indexOf(el.nodeName.toLowerCase()) >= 0) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    function targetNeedsFocus(el) {
        if (document.activeElement === el) {
            return false;
        }
        var tag = el.nodeName.toLowerCase();
        var skipInputs = ('button checkbox file image radio submit').split(' ');
        if (el.disabled || el.readOnly) return false;
        if (tag === 'textarea') return true;
        if (tag === 'select') {
            if (app.device.android) return false;
            else return true;
        }
        if (tag === 'input' && skipInputs.indexOf(el.type) < 0) return true;
    }
    function targetNeedsPrevent(el) {
        el = $(el);
        var prevent = true;
        if (el.is('label') || el.parents('label').length > 0) {
            if (app.device.android) {
                prevent = false;
            }
            else if (app.device.ios && el.is('input')) {
                prevent = true;
            }
            else prevent = false;
        }
        return prevent;
    }

    // Mouse Handlers
    function handleMouseDown (e) {
        dispatcher.global.emit(HIGHLIGTH_START_EVENT, e);
        if ('which' in e && e.which === 3) {
            setTimeout(function () {
                dispatcher.global.emit(HIGHLIGTH_END_EVENT, e);
            }, 0);
        }
    }
    function handleMouseMove (e) {
        dispatcher.global.emit(HIGHLIGTH_END_EVENT, e);
    }
    function handleMouseUp (e) {
        dispatcher.global.emit(HIGHLIGTH_END_EVENT, e);
    }

    // Touch Handlers
    function handleTouchStart(e) {
        isMoved = false;
        tapHoldFired = false;
        if (e.targetTouches.length > 1) {
            if (activableElement) dispatcher.global.emit(HIGHLIGTH_END_EVENT, e);
            return true;
        }
        if (e.touches.length > 1 && activableElement) {
            dispatcher.global.emit(HIGHLIGTH_END_EVENT, e);
        }
        
        if (tapHoldTimeout) clearTimeout(tapHoldTimeout);
        tapHoldTimeout = setTimeout(function () {
            if (e && e.touches && e.touches.length > 1) return;
            tapHoldFired = true;
            e.preventDefault();
            dispatcher.global.emit(LONG_TAP_EVENT, e);
        }, 750);
    
        if (needsFastClickTimeOut) clearTimeout(needsFastClickTimeOut);
        needsFastClick = targetNeedsFastClick(e.target);

        if (!needsFastClick) {
            trackClick = false;
            return true;
        }
        if (device.ios || (device.android && 'getSelection' in window)) {
            var selection = window.getSelection();
            if (selection.rangeCount && selection.focusNode !== document.body && (!selection.isCollapsed || document.activeElement === selection.focusNode)) {
                activeSelection = true;
                return true;
            }
            else {
                activeSelection = false;
            }
        }
        if (device.android)  {
            if (androidNeedsBlur(e.target)) {
                document.activeElement.blur();
            }
        }

        trackClick = true;
        targetElement = e.target;
        touchStartTime = (new Date()).getTime();
        touchStartX = e.targetTouches[0].pageX;
        touchStartY = e.targetTouches[0].pageY;

        // Detect scroll parent
        /*if (app.device.ios) {
            scrollParent = undefined;
            $(targetElement).parents().each(function () {
                var parent = this;
                if (parent.scrollHeight > parent.offsetHeight && !scrollParent) {
                    scrollParent = parent;
                    scrollParent.f7ScrollTop = scrollParent.scrollTop;
                }
            });
        }*/
        if ((e.timeStamp - lastClickTime) < 50) {
            e.preventDefault();
        }

        //if (app.params.activeState) {
            //activableElement = findActivableElement(targetElement);
            // If it's inside a scrollable view, we don't trigger active-state yet,
            // because it can be a scroll instead. Based on the link:
            // http://labnote.beedesk.com/click-scroll-and-pseudo-active-on-mobile-webk
            if (!isInsideScrollableView(targetElement /*activableElement*/)) {
                dispatcher.global.emit(HIGHLIGTH_END_EVENT, e);
            } else {
                activeTimeout = setTimeout(()=>dispatcher.global.emit(HIGHLIGTH_END_EVENT, e), 80);
            }
        //}
        
        e.touchStartX = touchStartX;
        e.touchStartY = touchStartY;
        dispatcher.global.emit(HIGHLIGTH_START_EVENT, e);
        if (app.params.material && app.params.materialRipple) {
            rippleTouchStart(targetElement, touchStartX, touchStartY);
        }
    }
    function handleTouchMove(e) {
        if (!trackClick) return;
        var _isMoved = false;
        var distance = app.params.fastClicksDistanceThreshold;
        if (distance) {
            var pageX = e.targetTouches[0].pageX;
            var pageY = e.targetTouches[0].pageY;
            if (Math.abs(pageX - touchStartX) > distance ||  Math.abs(pageY - touchStartY) > distance) {
                _isMoved = true;
            }
        }
        else {
            _isMoved = true;
        }
        if (_isMoved) {
            trackClick = false;
            targetElement = null;
            isMoved = true;
            if (app.params.tapHold) {
                clearTimeout(tapHoldTimeout);
            }
			if (app.params.activeState) {
				clearTimeout(activeTimeout);
				removeActive();
			}
            if (app.params.material && app.params.materialRipple) {
                rippleTouchMove();
            }
        }
    }
    function handleTouchEnd(e) {
        clearTimeout(activeTimeout);
        clearTimeout(tapHoldTimeout);

        if (!trackClick) {
            if (!activeSelection && needsFastClick) {
                if (!(app.device.android && !e.cancelable)) {
                    e.preventDefault();
                }
            }
            return true;
        }

        if (document.activeElement === e.target) {
            if (app.params.activeState) removeActive();
            if (app.params.material && app.params.materialRipple) {
                rippleTouchEnd();
            }
            return true;
        }

        if (!activeSelection) {
            e.preventDefault();
        }

        if ((e.timeStamp - lastClickTime) < app.params.fastClicksDelayBetweenClicks) {
            setTimeout(removeActive, 0);
            return true;
        }

        lastClickTime = e.timeStamp;

        trackClick = false;

        if (app.device.ios && scrollParent) {
            if (scrollParent.scrollTop !== scrollParent.f7ScrollTop) {
                return false;
            }
        }

        // Add active-state here because, in a very fast tap, the timeout didn't
        // have the chance to execute. Removing active-state in a timeout gives
        // the chance to the animation execute.
        if (app.params.activeState) {
            addActive();
            setTimeout(removeActive, 0);
        }
        // Remove Ripple
        if (app.params.material && app.params.materialRipple) {
            rippleTouchEnd();
        }

        // Trigger focus when required
        if (targetNeedsFocus(targetElement)) {
            if (app.device.ios && app.device.webView) {
                if ((event.timeStamp - touchStartTime) > 159) {
                    targetElement = null;
                    return false;
                }
                targetElement.focus();
                return false;
            }
            else {
                targetElement.focus();
            }
        }

        // Blur active elements
        if (document.activeElement && targetElement !== document.activeElement && document.activeElement !== document.body && targetElement.nodeName.toLowerCase() !== 'label') {
            document.activeElement.blur();
        }

        // Send click
        e.preventDefault();
        sendClick(e);
        return false;
    }
    function handleTouchCancel(e) {
        trackClick = false;
        targetElement = null;

        // Remove Active State
        clearTimeout(activeTimeout);
        clearTimeout(tapHoldTimeout);
        if (app.params.activeState) {
            removeActive();
        }

        // Remove Ripple
        if (app.params.material && app.params.materialRipple) {
            rippleTouchEnd();
        }
    }

    function handleClick(e) {
        var allowClick = false;

        if (trackClick) {
            targetElement = null;
            trackClick = false;
            return true;
        }
        if (e.target.type === 'submit' && e.detail === 0) {
            return true;
        }
        if (!targetElement) {
            if (!isFormElement(e.target)) {
                allowClick =  true;
            }
        }
        if (!needsFastClick) {
            allowClick = true;
        }
        if (document.activeElement === targetElement) {
            allowClick =  true;
        }
        if (e.forwardedTouchEvent) {
            allowClick =  true;
        }
        if (!e.cancelable) {
            allowClick =  true;
        }
        if (app.params.tapHold && app.params.tapHoldPreventClicks && tapHoldFired) {
            allowClick = false;
        }
        if (!allowClick) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            if (targetElement) {
                if (targetNeedsPrevent(targetElement) || isMoved) {
                    e.preventDefault();
                }
            }
            else {
                e.preventDefault();
            }
            targetElement = null;
        }
        needsFastClickTimeOut = setTimeout(function () {
            needsFastClick = false;
        }, (app.device.ios || app.device.androidChrome ? 100 : 400));

        if (app.params.tapHold) {
            tapHoldTimeout = setTimeout(function () {
                tapHoldFired = false;
            }, (app.device.ios || app.device.androidChrome ? 100 : 400));
        }

        return allowClick;
    }
    if (app.support.touch) {
        document.addEventListener('click', handleClick, true);

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchCancel);
    }
    else {
        if (app.params.activeState) {
            document.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    }
    if (app.params.material && app.params.materialRipple) {
        document.addEventListener('contextmenu', function (e) {
            if (activableElement) removeActive();
            rippleTouchEnd();
        });
    }

};