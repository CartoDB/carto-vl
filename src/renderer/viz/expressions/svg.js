import Sprite from './sprite';

export default class SVG extends Sprite {
    constructor(svg){
        super('data:image/svg+xml,' + encodeURIComponent(svg));
    }
}
