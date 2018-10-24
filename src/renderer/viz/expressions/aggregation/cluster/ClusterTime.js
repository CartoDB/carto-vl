import ClusterTimeDimension from './ClusterTimeDimension';
import { checkMaxArguments, checkStringValue } from '../../utils';

export default class ClusterTime extends ClusterTimeDimension {
    constructor (property, timeUnits, timezone) {
        const isCyclic = ClusterTimeDimension.cyclicUnits.includes(timeUnits);
        checkMaxArguments(arguments, 3, 'clusterTime');
        const validUnits = isCyclic ? ClusterTimeDimension.cyclicUnits : ClusterTimeDimension.serialUnits;
        checkStringValue('clusterTime', 'timeUnits', 1, timeUnits, validUnits);
        if (!isCyclic) {
            throw new Error('ClusterTime does not support non-cyclic units; use ClusterTimeRange instead');
        }
        super({
            property,
            expressionName: 'clusterTime',
            dimension: {
                group: {
                    units: timeUnits,
                    timezone
                },
                format: isCyclic ? 'number' : 'iso'
            },
            type: isCyclic ? 'number' : 'category'
        });
    }
}
