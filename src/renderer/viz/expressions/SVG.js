import Image from './Image';

export default class SVG extends Image {
    constructor(svg) {
        super(`data:image/svg+xml,${encodeURIComponent(svg)}`);
    }
}
