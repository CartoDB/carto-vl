import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonthStart extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterMonthStart');
        super({
            property,
            expressionName: 'clusterMonthStart',
            grouping: {
                grouping: 'month',
                count: count,
                starting,
                timezone,
                format: 'iso'
            },
            type: 'date',
            mode: 'start'
        });
    }
}
