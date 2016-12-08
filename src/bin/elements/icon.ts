import {noView} from 'aurelia-framework';

/**
 * icon.ts
 * @attribute icon
 * @version 1.0.0
 * @example:
 *      <icon name="icon-link"></icon>       
 */

@noView
export class Icon{
    static inject = [Element];

    constructor(e:Element){
        var link  = e.getAttribute('src'),
            fill  = e.getAttribute('color'),
            center= e.getAttribute('center'),
            size  = Number(e.getAttribute('size') || 24),
            css   = ` width:${size}px;height:${size}px;`,
            html;
        
        e['style'].cssText += css;

        if (center){
            css += `position:absolute;top:50%;left:50%;margin-top:-${size/2}px;margin-left:-${size/2}px;`;        
        }

        fill = fill ? `fill:${fill}` : '';
        html = `<svg class="icon${size}" style="${css}${fill}"><use xlink:href="#${link}"></use></svg>`;

        e.innerHTML = html;
    }
}