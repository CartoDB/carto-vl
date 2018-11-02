import BaseCodec from './Base';

// The Identity codec class serves
// as the default, identity encoding, in which all three
// encodings are exactly the same.
export default class IdentityCodec extends BaseCodec {
    isIdentity () {
        return true;
    }

    sourceToInternal (v) {
        return v;
    }

    internalToExternal (v) {
        return v;
    }

    sourceToExternal (v) {
        return v;
    }

    externalToSource (v) {
        return v;
    }

    externalToInternal (v) {
        return v;
    }
}
