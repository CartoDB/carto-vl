import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterHour extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterHour');
        super({
            property,
            expressionName: 'clusterHour',
            dimension: {
                group: {
                    units: 'hour',
                    count: count,
                    starting,
                    timezone
                }
            },
            type: 'number'
        });
    }
}
