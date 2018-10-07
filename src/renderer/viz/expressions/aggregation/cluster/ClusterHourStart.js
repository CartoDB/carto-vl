import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterHourStart extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterHourStart');
        super({
            property,
            expressionName: 'clusterHourStart',
            dimension: {
                group: {
                    units: 'hour',
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'start'
        });
    }
}
