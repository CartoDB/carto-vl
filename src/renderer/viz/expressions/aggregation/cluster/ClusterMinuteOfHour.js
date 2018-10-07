import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterMinuteOfHour extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterMinuteOfHour');
        super({
            property,
            expressionName: 'clusterMinuteOfHour',
            dimension: {
                group: { units: 'minuteOfHour', timezone }
            },
            type: 'number'
        });
    }
}
