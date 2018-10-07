import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterWeekOfYear extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterWeekOfYear');
        super({
            property,
            expressionName: 'clusterWeekOfYear',
            dimension: {
                group: { units: 'weekOfYear', timezone }
            },
            type: 'number'
        });
    }
}
