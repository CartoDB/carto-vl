import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterQuarterOfYear extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 2, 'clusterQuarterOfYear');
        super({
            property,
            expressionName: 'clusterQuarterOfYear',
            dimension: {
                group: { units: 'quarterOfYear', timezone }
            },
            type: 'number'
        });
    }
}
