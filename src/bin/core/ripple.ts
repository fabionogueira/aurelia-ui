import dispatcher from './dispatcher';

let touchStartX, touchStartY, touchStartTime;

/*dispatcher.global.observe('highlightStart', e=>{
    //rippleTouchStart(e.target, e.touchStartX, e.touchStartY);
});
dispatcher.global.observe('highlightEnd', e=>{

});*/

document.addEventListener('mousedown', e=>{
    touchStartX = e.pageX;
    touchStartY = e.pageY;
    //rippleTouchStart(e.target, e.pageX, e.pageY);
});
//document.addEventListener('mousemove', rippleTouchMove);
//document.addEventListener('mouseup', rippleTouchEnd);

// Material Touch Ripple Effect
/*
function findRippleElement(el) {
    var needsRipple = app.params.materialRippleElements;
    var $el = $(el);
    if ($el.is(needsRipple)) {
        if ($el.hasClass('no-ripple')) {
            return false;
        }
        return $el;
    }
    else if ($el.parents(needsRipple).length > 0) {
        var rippleParent = $el.parents(needsRipple).eq(0);
        if (rippleParent.hasClass('no-ripple')) {
            return false;
        }
        return rippleParent;
    }
    else return false;
}
function createRipple(x, y, el) {
    var box = el[0].getBoundingClientRect();
    var center = {
        x: x - box.left,
        y: y - box.top
    },
        height = box.height,
        width = box.width;
    var diameter = Math.max(Math.pow((Math.pow(height, 2) + Math.pow(width, 2)), 0.5), 48);

    rippleWave = $(
        '<div class="ripple-wave" style="width: ' + diameter + 'px; height: '+diameter+'px; margin-top:-'+diameter/2+'px; margin-left:-'+diameter/2+'px; left:'+center.x+'px; top:'+center.y+'px;"></div>'
    );
    el.prepend(rippleWave);
    var clientLeft = rippleWave[0].clientLeft;
    rippleTransform = 'translate3d('+(-center.x + width/2)+'px, '+(-center.y + height/2)+'px, 0) scale(1)';
    rippleWave.transform(rippleTransform);
}

function removeRipple() {
    if (!rippleWave) return;
    var toRemove = rippleWave;

    var removeTimeout = setTimeout(function () {
        toRemove.remove();
    }, 400);

    rippleWave
        .addClass('ripple-wave-fill')
        .transform(rippleTransform.replace('scale(1)', 'scale(1.01)'))
        .transitionEnd(function () {
            clearTimeout(removeTimeout);

            var rippleWave = $(this)
                .addClass('ripple-wave-out')
                .transform(rippleTransform.replace('scale(1)', 'scale(1.01)'));

            removeTimeout = setTimeout(function () {
                rippleWave.remove();
            }, 700);

            setTimeout(function () {
                rippleWave.transitionEnd(function(){
                    clearTimeout(removeTimeout);
                    $(this).remove();
                });
            }, 0);
        });

    rippleWave = rippleTarget = undefined;
}

function rippleTouchStart (el, x, y) {
    rippleTarget = findRippleElement(el);
    if (!rippleTarget || rippleTarget.length === 0) {
        rippleTarget = undefined;
        return;
    }
    if (!isInsideScrollableView(rippleTarget)) {
        createRipple(touchStartX, touchStartY, rippleTarget);
    }
    else {
        rippleTimeout = setTimeout(function () {
            createRipple(touchStartX, touchStartY, rippleTarget);
        }, 80);
    }
}
function rippleTouchMove() {
    clearTimeout(rippleTimeout);
    removeRipple();
}
function rippleTouchEnd() {
    if (rippleWave) {
        removeRipple();
    }
    else if (rippleTarget && !isMoved) {
        clearTimeout(rippleTimeout);
        createRipple(touchStartX, touchStartY, rippleTarget);
        setTimeout(removeRipple, 0);
    }
    else {
        removeRipple();
    }
}
*/