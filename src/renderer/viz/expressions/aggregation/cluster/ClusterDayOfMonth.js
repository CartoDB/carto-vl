import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterDayOfMonth extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterDayOfMonth');
        super({
            property,
            expressionName: 'clusterDayOfMonth',
            dimension: {
                group: { units: 'dayOfMonth', timezone }
            },
            type: 'number'
        });
    }
}
