import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonthStart extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterMonthStart');
        super({
            property,
            expressionName: 'clusterMonthStart',
            dimension: {
                group: {
                    units: 'month',
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'start'
        });
    }
}
