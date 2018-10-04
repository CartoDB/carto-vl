import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonthIso extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterMonthIso');
        super({
            property,
            expressionName: 'clusterMonth',
            grouping: {
                grouping: 'month',
                count: count,
                starting,
                timezone,
                format: 'iso'
            },
            type: 'category'
        });
    }
}
