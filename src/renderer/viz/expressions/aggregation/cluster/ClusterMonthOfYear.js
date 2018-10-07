import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonthOfYear extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterMonthOfYear');
        super({
            property,
            expressionName: 'clusterMonthOfYear',
            dimension: {
                group: { units: 'monthOfYear', timezone }
            },
            type: 'number'
        });
    }
}
