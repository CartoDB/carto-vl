import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterDayOfWeek extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterDayOfWeek');
        super({
            property,
            expressionName: 'clusterDayOfWeek',
            dimension: {
                group: { units: 'dayOfWeek', timezone },
            },
            type: 'number'
        });
    }
}
