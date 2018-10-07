import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterHourOfDay extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterHourOfDay');
        super({
            property,
            expressionName: 'clusterHourOfDay',
            dimension: {
                group: { units: 'hourOfDay', timezone }
            },
            type: 'number'
        });
    }
}
