import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterHourIso extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterHourIso');
        super({
            property,
            expressionName: 'clusterHourIso',
            dimension: {
                group: {
                    units: 'hour',
                    timezone
                },
                format: 'iso'
            },
            type: 'category'
        });
    }
}
