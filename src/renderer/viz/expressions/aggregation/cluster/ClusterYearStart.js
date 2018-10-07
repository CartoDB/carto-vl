import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterYearStart extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterYearStart');
        super({
            property,
            expressionName: 'clusterYearStart',
            dimension: {
                group: {
                    units: 'year',
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'start'
        });
    }
}
