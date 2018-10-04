import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonth extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterMonth');
        super({
            property,
            expressionName: 'clusterMonth',
            grouping: {
                grouping: 'month',
                count: count,
                starting,
                timezone
            },
            type: 'number'
        });
    }
}
