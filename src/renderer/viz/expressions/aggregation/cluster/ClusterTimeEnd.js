import ClusterTimeDimension from './ClusterTimeDimension';
import { checkMaxArguments, checkStringValue } from '../../utils';

export default class ClusterTimeEnd extends ClusterTimeDimension {
    constructor (property, timeUnits, timezone) {
        checkMaxArguments(arguments, 3, 'clusterTimeEnd');
        const validUnits = ClusterTimeDimension.serialUnits;
        checkStringValue('clusterTimeEnd', 'timeUnits', 1, timeUnits, validUnits);
        super({
            property,
            expressionName: 'clusterTimeEnd',
            dimension: {
                group: {
                    units: timeUnits,
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'end'
        });
    }
}
