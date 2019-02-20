import BaseCodec from './Base';

// The Identity codec class serves
// as the default, identity encoding, in which all three
// encodings are exactly the same.
export default class IdentityCodec extends BaseCodec {
    isIdentity () {
        return true;
    }

    sourceToInternal (metadata, v) {
        return v;
    }

    internalToExternal (metadata, v) {
        return v;
    }

    sourceToExternal (metadata, v) {
        return v;
    }

    externalToSource (metadata, v) {
        return v;
    }

    externalToInternal (metadata, v) {
        return v;
    }
}
