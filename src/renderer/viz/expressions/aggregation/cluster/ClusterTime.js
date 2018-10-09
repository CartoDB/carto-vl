import ClusterTimeDimension from './ClusterTimeDimension';
import { checkMaxArguments, checkStringValue } from '../../utils';

export default class ClusterTime extends ClusterTimeDimension {
    constructor (property, timeUnits, timezone) {
        checkMaxArguments(arguments, 3, 'clusterTime');
        const validUnits = ClusterTimeDimension.serialUnits;
        checkStringValue('clusterTime', 'timeUnits', 1, timeUnits, validUnits);
        super({
            property,
            expressionName: 'clusterTime',
            dimension: {
                group: {
                    units: timeUnits,
                    timezone
                },
                format: 'iso'
            },
            type: 'category'
        });
    }
}
