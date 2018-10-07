import ClusterTime from './ClusterTime';
import { checkMaxArguments } from '../../utils';
export default class ClusterYearEnd extends ClusterTime {
    constructor (property, timezone) {
        checkMaxArguments(arguments, 4, 'clusterYearEnd');
        super({
            property,
            expressionName: 'clusterYearEnd',
            dimension: {
                group: {
                    units: 'year',
                    timezone
                },
                format: 'iso'
            },
            type: 'date',
            mode: 'end'
        });
    }
}
