import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterDayStart extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterDayStart');
        super({
            property,
            expressionName: 'clusterDayStart',
            dimension: {
                group: {
                    units: 'day',
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'start'
        });
    }
}
