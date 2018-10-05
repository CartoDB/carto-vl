import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonthEnd extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterMonthEnd');
        super({
            property,
            expressionName: 'clusterMonthEnd',
            grouping: {
                grouping: 'month',
                count: count,
                starting,
                timezone,
                format: 'iso'
            },
            type: 'date',
            mode: 'end'
        });
    }
}
