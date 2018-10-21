// A Dataframe Codec is used to transform between property value encodings.
// Three different encodings are handled:
// * The `source` encoding correspond to the format in which
//   the property values appear in the data sources (e.g. in MVT)
// * The `internal` encoding is used in Dataframe properties
//   apt for GPU consumption.
// * The `external` encoding is the format in which feature
//   properties are presented to the user
//   (e.g. `property.eval(feature)` or `globalMin(property)`)
// The Codec base class serves both as a base for derived codecs.
// TODO: null/NaN handling here or in the default identity?
// TODO: three defaults: number, date, category?
// Codecs are associated to source properties.
// There are two kind of codecs:
// * Scalar (simple) encoder: source value is encoded as a single internal value
// * Range encoder: a source value encodes as a pair [lo, hi] of values.
export class BaseCodec {
    isRange () {
        return false;
    }

    // Convert source encoding to internal;
    // Result is always an array, [value] for scalar codecs
    // and [lo, hi] for range codecs.
    // Used to encode sources into dataframe properties.
    sourceToInternal (v) {
        return v;
    }

    // Convert internal encoding to external;
    // Input may be one for scalar, or two values (hi, lo) for ranges.
    // Used to present dataframe features.
    internalToExternal (...v) {
        return v[0];
    }

    // Convert external encoding back to source values.
    // Used to generate SQL filters: (apply to constant/global)
    externalToSource (v) {
        return v;
    }

    // Convert source encoding to external encoding.
    // Used to present source stats values (global aggregations)
    // to match the format of constant expressions.
    sourceToExternal (v) {
        return this.internalToExternal(...this.sourceToInternal(v));
    }

    // Convert external to internal encoding.
    // Result is always an array, [value] for scalar codecs
    // and [lo, hi] for range codecs.
    // used to to apply filters in GLSL inlined code;
    // evaluate binary operations property vs external (constant/global
    externalToInternal (v) {
        return this.sourceToInternal(this.externalToSource(v));
    }

    // Generate GLSL inline expression to map a property value
    // to the internal encoding of another property.
    // Used to bind some binary operations between properties.
    inlineInternalMatch (thisValue, _otherCodec) {
        return `${thisValue}`;
    }

    // Encode external property limits (min,max) to produce a
    // combined pair of internal limits.
    // For internal range property pairs, combined limits as computed
    // with this method must be employed when mapping (e.g. for lineaer)
    // the values between them.
    limitsToInternal (min, max) {
        const [lo, hi] = [min, max].map(v => this.externalToInternal(v));
        if (this.isRange()) {
            return [lo[0], hi[1]];
        }
        return [lo[0], hi[0]];
    }
}

// The Identity codec class serves
// as the default, identity encoding, in which all three
// encodings are exactly the same.
export class IdentityCodec extends BaseCodec {
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
