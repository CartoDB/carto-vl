import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonthIso extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterMonthIso');
        super({
            property,
            expressionName: 'clusterMonthIso',
            dimension: {
                group: {
                    units: 'month',
                    timezone
                },
                format: 'iso'
            },
            type: 'category'
        });
    }
}
