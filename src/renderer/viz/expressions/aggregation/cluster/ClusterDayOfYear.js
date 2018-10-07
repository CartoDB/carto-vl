import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterDayOfYear extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterDayOfYear');
        super({
            property,
            expressionName: 'clusterDayOfYear',
            dimension: {
                group: { units: 'dayOfYear', timezone }
            },
            type: 'number'
        });
    }
}
