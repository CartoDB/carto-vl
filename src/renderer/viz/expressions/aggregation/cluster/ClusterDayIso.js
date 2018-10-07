import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterDayIso extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterDayIso');
        super({
            property,
            expressionName: 'clusterDayIso',
            dimension: {
                group: {
                    units: 'day',
                    timezone
                },
                format: 'iso'
            },
            type: 'category'
        });
    }
}
