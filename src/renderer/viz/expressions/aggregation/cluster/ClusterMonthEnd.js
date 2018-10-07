import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMonthEnd extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterMonthEnd');
        super({
            property,
            expressionName: 'clusterMonthEnd',
            dimension: {
                group: {
                    units: 'month',
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'end'
        });
    }
}
