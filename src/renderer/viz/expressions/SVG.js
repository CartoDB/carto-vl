import Image from './Image';
import { checkMaxArguments } from './utils';

export default class SVG extends Image {
    constructor (svg) {
        checkMaxArguments(arguments, 1, 'svg');
        super(`data:image/svg+xml,${encodeURIComponent(svg)}`);
    }
}
