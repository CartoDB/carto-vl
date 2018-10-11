// TODO: generic function with units arg.

import ClusterTimeDimension from './ClusterTimeDimension';
import { checkMaxArguments } from '../../utils';
export default class ClusterDay extends ClusterTimeDimension {
    constructor (property, timezone, count, starting) {
        checkMaxArguments(arguments, 4, 'clusterDay');
        super({
            property,
            expressionName: 'clusterDay',
            dimension: {
                group: {
                    units: 'day',
                    count: count,
                    starting,
                    timezone
                }
            },
            type: 'number'
        });
    }
}
