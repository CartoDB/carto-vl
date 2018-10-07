import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterHourEnd extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterHourEnd');
        super({
            property,
            expressionName: 'clusterHourEnd',
            dimension: {
                group: {
                    units: 'hour',
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'end'
        });
    }
}
