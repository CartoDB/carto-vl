import Palette from '../color/palettes/Palette';

export default class ReversePalette extends Palette {
    constructor (palette) {
        super(palette.name, palette.subPalettes);
        this.type = 'palette';
        this._originalPalette = palette;
        this.tags = palette.tags;
        this.subPalettes = new Proxy(palette.subPalettes, {
            get: (target, name) => {
                if (Number.isFinite(Number(name)) && Array.isArray(target[name])) {
                    return this._reversePalette(target[name]);
                }
                return target[name];
            }
        });
    }

    getLongestSubPalette () {
        return this._reversePalette(this._originalPalette.getLongestSubPalette());
    }

    _reversePalette (palette) {
        if (this.isQualitative()) {
            // Last color is 'others', therefore, we shouldn't change the order of that one
            const copy = [...palette];
            const others = copy.pop();
            return [...copy.reverse(), others];
        }
        return [...palette].reverse();
    }
}
