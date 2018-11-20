import CategoryCodec from '../Category';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';

export default class MVTCategoryCodec extends CategoryCodec {
    sourceToInternal (metadata, propertyValue) {
        const propertyValueType = typeof propertyValue;
        if (propertyValue !== null && propertyValueType !== 'undefined' && propertyValueType !== 'string') {
            // TODO: It would be nice to include the name of the source property in the error message.
            // In general Codecs are unique per original base property, not per source property,
            // but for the generic MVT sources we don't support multiple source properties per base property (e.g. aggregations)
            // so it would suffice to keep the property name in the Codec class.
            // For more general solutions we'd need to provide the source property name as an argument to this method.
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property is of type 'category' but the MVT tile contained a feature property of type '${propertyValueType}': '${propertyValue}'`);
        }
        return super.sourceToInternal(metadata, propertyValue);
    }
}
