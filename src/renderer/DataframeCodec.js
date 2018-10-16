
// A DataframeCodec provides two abstract operations:
// encoding: converts source property values (as provided by a source)
// into an internal form use in Dataframes.
// decoding: converts an internal (dataframe) value to an external
// format apt for presentation to the user as feature properties.
// Despite the naming, encode and decode operations are not symmetrical;
// one if not necessarily the converse of the other.
//     source -> encode -> dataframe -> decode -> user (feature)
// This acts as an abstract base class, with specializations for each source
export default class DataframeCodec {
    encode (_metadata, _propertyName, propertyValue) {
        return propertyValue;
    }
    // FIXME: rename as present?
    decode (_metadata, _propertyName, ...propertyValues) {
        return propertyValue[0];
    }
}
