
import ClusterTimeDimension from './ClusterTimeDimension';
import { checkExpression, checkMaxArguments, checkStringValue } from '../../utils';

export default class ClusterTimeRange extends ClusterTimeDimension {
    constructor (property, units, timezone) {
        const expressionName = 'clusterTimeRange';
        checkMaxArguments(arguments, 3, expressionName);
        checkExpression(expressionName, 'property', 0, property);
        const validUnits = ClusterTimeDimension.serialUnits;
        checkStringValue(expressionName, 'units', 1, units, validUnits);

        super({
            property,
            expressionName,
            dimension: {
                group: {
                    units: units,
                    timezone
                },
                format: 'iso'
            },
            type: 'timerange',
            range: []
        });
    }
}
