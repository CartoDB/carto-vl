import ClusterTimeDimension from './ClusterTimeDimension';
import { checkExpression, checkMaxArguments, checkStringValue } from '../../utils';

export default class ClusterTime extends ClusterTimeDimension {
    constructor (property, units, timezone) {
        const expressionName = 'clusterTime';
        const isCyclic = ClusterTimeDimension.cyclicUnits.includes(units);
        checkMaxArguments(arguments, 3, expressionName);
        checkExpression(expressionName, 'property', 0, property);
        const validUnits = isCyclic ? ClusterTimeDimension.cyclicUnits : ClusterTimeDimension.serialUnits;
        checkStringValue(expressionName, 'units', 1, units, validUnits);
        super({
            property,
            expressionName,
            dimension: {
                group: {
                    units: units,
                    timezone
                },
                format: isCyclic ? 'number' : 'iso'
            },
            type: isCyclic ? 'number' : 'timerange',
            range: isCyclic ? undefined : []
        });
    }
    converse (v) {
        return v;
    }
}
