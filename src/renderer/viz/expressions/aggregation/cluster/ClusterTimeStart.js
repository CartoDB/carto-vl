import ClusterTimeDimension from './ClusterTimeDimension';
import { checkMaxArguments, checkStringValue } from '../../utils';

export default class ClusterTimeStart extends ClusterTimeDimension {
    constructor (property, timeUnits, timezone) {
        checkMaxArguments(arguments, 3, 'clusterTimeStart');
        const validUnits = ClusterTimeDimension.serialUnits;
        checkStringValue('clusterTimeStart', 'timeUnits', 1, timeUnits, validUnits);
        super({
            property,
            expressionName: 'clusterTimeStart',
            dimension: {
                group: {
                    units: timeUnits,
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'start'
        });
    }
}
