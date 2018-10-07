import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterDay extends ClusterTime {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterDay');
        super({
            property,
            expressionName: 'clusterDay',
            dimension: {
                group: {
                    units: 'day',
                    count: count,
                    starting,
                    timezone
                }
            },
            type: 'number'
        });
    }
}
