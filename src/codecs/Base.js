// A Dataframe property Codec is used to transform between property value encodings.
// Three different encodings are handled:
// * The `source` encoding correspond to the format in which
//   the property values appear in the data sources (e.g. in MVT)
// * The `internal` encoding is used in Dataframe properties
//   apt for GPU consumption.
// * The `external` encoding is the format in which feature
//   properties are presented to the user
//   (e.g. `property.eval(feature)` or `globalMin(property)`)
// The Codec base class serves both as a base for derived codecs.
// Codecs are associated to source properties.
// There are two kind of codecs:
// * Scalar (simple) encoder: source value is encoded as a single internal value
// * Range encoder: a source value encodes as a pair [lo, hi] of values.
export default class BaseCodec {
    isRange () {
        return false;
    }

    isIdentity () {
        return false;
    }

    // Convert source encoding to internal;
    // Result is an array [lo, hi] for ranges and a value for scalar codecs
    // Used to encode sources into dataframe properties.
    sourceToInternal (metadata, v) {
        return v;
    }

    // Convert internal encoding to external;
    // Input may be one for scalar, or two values (hi, lo) for ranges.
    // Used to present dataframe features.
    internalToExternal (metadata, v) {
        return v;
    }

    // Convert external encoding back to source values.
    // Used to generate SQL filters: (apply to constant/global)
    externalToSource (metadata, v) {
        return v;
    }

    // Convert source encoding to external encoding.
    // Used to present source stats values (global aggregations)
    // to match the format of constant expressions.
    sourceToExternal (metadata, v) {
        return this.internalToExternal(metadata, this.sourceToInternal(metadata, v));
    }

    // Convert external to internal encoding.
    // Result is a value for scalar codecs
    // and [lo, hi] for range codecs.
    // used to to apply filters in GLSL inlined code;
    // evaluate binary operations property vs external (constant/global
    externalToInternal (metadata, v) {
        return this.sourceToInternal(metadata, this.externalToSource(metadata, v));
    }

    // Generate GLSL inline expression to map a property value
    // to the internal encoding of another property.
    // Used to bind some binary operations between properties.
    inlineInternalMatch (thisValue, _otherCodec) {
        return `${thisValue}`;
    }
}
