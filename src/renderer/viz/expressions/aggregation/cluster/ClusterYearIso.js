import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterYear extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterYear');
        super({
            property,
            expressionName: 'clusterYear',
            dimension: {
                group: {
                    units: 'year',
                    timezone
                },
                format: 'iso'
            },
            type: 'number'
        });
    }
}
