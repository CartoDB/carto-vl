import Palette from '../color/palettes/Palette';

export default class ReversePalette extends Palette {
    _bindMetadata (metadata) {
        this.type = 'palette';
        this.childType = 'color';
        this.subPalettes = new Proxy(this.input.subPalettes, {
            get: (target, name) => {
                if (Number.isFinite(Number(name)) && Array.isArray(target[name])) {
                    return this._reversePalette(target[name]);
                }
                return target[name];
            }
        });
        this.tags = this.input.tags;
    }

    getLongestSubPalette () {
        return this._reversePalette(this.input.getLongestSubPalette());
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
