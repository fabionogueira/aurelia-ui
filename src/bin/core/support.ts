let support = {
    //isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    touch: !!(('ontouchstart' in window) || window['DocumentTouch'] && document instanceof window['DocumentTouch'])
};

document.body.classList.add(support.touch ? 'is-touch' : 'is-desktop')

export default support;
