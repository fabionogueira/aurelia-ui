
/*============================================
    Device/OS Detection
    https://github.com/nolimits4web/Framework7
=============================================*/

interface IDevice{
    ios    : boolean
    android: boolean
    iphone : boolean
    ipad   : boolean
    androidChrome: boolean
    os: string
    osVersion: string
    webView: boolean
    statusBar: boolean
    pixelRatio: number
}

let device:IDevice;
let ua = navigator.userAgent;

let android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
let ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
let iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;

// Android
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
// iOS
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
// iOS 8+ changed UA
if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
    if (device.osVersion.split('.')[0] === '10') {
        device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
    }
}

// Webview
device.webView = Boolean((iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i));

// Check for status bar and fullscreen app mode
let windowWidth = document.body.clientWidth;
let windowHeight = 20;//$(window).height();
device.statusBar = false;
if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
    device.statusBar = true;
}else {
    device.statusBar = false;
}

// Classes
let classNames = [];

// Pixel Ratio
device.pixelRatio = window.devicePixelRatio || 1;
classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
if (device.pixelRatio >= 2) {
    classNames.push('retina');
}

// OS classes
if (device.os) {
    classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
    if (device.os === 'ios') {
        let i, major = parseInt(device.osVersion.split('.')[0], 10);
        for (i = major - 1; i >= 6; i--) {
            classNames.push('ios-gt-' + i);
        }
    }
    
}

// Add html classes
if (classNames.length > 0) document.body.classList.add(classNames.join(' '));

// Export object
export default device;
