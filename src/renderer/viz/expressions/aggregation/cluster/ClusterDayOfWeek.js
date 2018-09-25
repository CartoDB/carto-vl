import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterDayOfWeek extends ClusterTime {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'clusterDayOfWeek');
        super({
            property,
            expressionName: 'clusterDayOfWeek',
            grouping: {
                group_by: 'dayOfWeek'
            },
            dimType: 'date'
        });
    }
}
