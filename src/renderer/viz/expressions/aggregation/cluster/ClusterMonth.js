import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonth extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterMonth');
        super({
            property,
            expressionName: 'clusterMonth',
            grouping: {
                group_by: 'month',
                group_by_count: count,
                starting,
                timezone
            },
            dimType: 'date'
        });
    }
}
