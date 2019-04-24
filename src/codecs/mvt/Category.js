import CategoryCodec from '../Category';
import CartoRuntimeError, { CartoRuntimeErrorTypes } from '../../errors/carto-runtime-error';

export default class MVTCategoryCodec extends CategoryCodec {
    sourceToInternal (metadata, propertyValue) {
        const propertyValueType = typeof propertyValue;
        if (propertyValue !== null && propertyValueType !== 'undefined' && propertyValueType !== 'string') {
            // In general Codecs are unique per original base property, not per source property,
            // but for the generic MVT sources we don't support multiple source properties per base property (e.g. aggregations)
            // so it would suffice to keep the property name in the Codec class.
            // For more general solutions we'd need to provide the source property name as an argument to this method.
            throw new CartoRuntimeError(
                `MVT decoding error. Metadata property '${this._baseName}' is of type 'category' but the MVT tile contained a feature property of type '${propertyValueType}': '${propertyValue}'`,
                CartoRuntimeErrorTypes.MVT
            );
        }
        return super.sourceToInternal(metadata, propertyValue);
    }
}
