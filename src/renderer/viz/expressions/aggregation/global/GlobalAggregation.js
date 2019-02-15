import BaseExpression from '../../base';
import { number } from '../../../expressions';
import { implicitCast } from '../../utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../errors/carto-validation-error';

/**
 * Global aggregation expressions compute summary stats of properties for the whole dataset.
 * As such, they rely on data provided by the backend, and not on the possibly incomplete
 * set of features transferred to the client.
 *
 * In addition, the properties used in the visualization may have been aggregated into
 * clusters, if *cluster* aggregation expressions have been used.
 *
 * Since cluster aggregation is zoom-level-dependant (because the cluster size varies with
 * the zoom level), global aggregates cannot be assigned definite values for
 * cluster-aggregated properties in general.
 *
 * In some specific cases it possible to assign a defined value to the combination of a
 * global aggregation and a cluster aggregation. Such is the case with
 * `globalMin(clusterMin($p))`, `globalMax(clusterMax($p))`,
 * `globalSum(clusterCount($column))` and `globalSum(clusterSum($column))`.
 *
 * In the interest of allowing the use of `linear` without explicit limits in as many cases
 * as possible, we should make `globalMin()` and `globalMax()`, which are used
 * to compute the automatic linear limits, work with as many cluster expressions as possible,
 * to allow the convenient use of cluster aggregations in simple linear expressions.
 *
 * For that reason we'll allow global aggregations to work not only with those cluster
 * aggregations that yield definite values, but also for other cases in which we can
 * efficiently compute (with the available backend stats) the limit value for high zoom
 * level; and only in cases with fast monotonic convergence (which is not the case for example
 * for `globalSum(clusterMin($p)))` or `globalMin(clusterSum($p))`).
 *
 * Here's a table of global-cluster aggregation combinations showing which cases
 * have been implemented (the rest produce invalid input errors). Columns are cluster
 * aggregations and rows are global aggregations. Each cell shows the metadata stat
 * used to compute the combinations. For the cases varying per zoom level a tilde prefixes
 * the stat, two tildes for the more questionable cases.
 *
 * |         | c-Avg   | c-Count | c-Max   | c-Min   | c-Mode | c-Sum |
 * |---------|---------|---------|---------|---------|--------|-------|
 * | g-Avg   |   ~avg  |   ERR   |   ERR   |   ERR   |   ERR  |   ERR |
 * | g-Max   |   ~max  |   ERR   |   max   |  ~~max  |   ERR  |   ERR |
 * | g-Min   |   ~min  |   ERR   |  ~~min  |   min   |   ERR  |   ERR |
 * | g-Sum   |   ERR   |   count |   ERR   |   ERR   |   ERR  |   sum |
 *
 */

export default class GlobalAggregation extends BaseExpression {
    /**
     * @param {*} property
     * @param {*} name
     */
    constructor ({ property, name, type, baseStats = false }) {
        super({ _value: number(0) });
        this.property = implicitCast(property);
        this._name = name;
        this.type = type;
        this.baseStats = baseStats;
        super.inlineMaker = inline => inline._value;
    }

    toString () {
        return `${this.expressionName}(${this.property.toString()})`;
    }

    isFeatureDependent () {
        return false;
    }

    eval () {
        return this._value.expr;
    }

    _resolveAliases (aliases) {
        if (this.property) {
            this.property._resolveAliases(aliases);
        }
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this.property._bindMetadata(metadata);
        const propertyName = this.property.propertyName || this.property.name;
        const value = this._getValueFromStats(metadata, propertyName);
        this._value.expr = metadata.codec(propertyName).sourceToExternal(metadata, value);
    }

    _getValueFromStats (metadata, propertyName) {
        let value;
        if (this.baseStats) {
            // Use base stats (pre-aggregation)
            if (this.baseStats === '_count') {
                // Use count
                value = metadata.featureCount;
            } else {
                // Use some specific column stat
                const stats = metadata.stats(this.property.name);
                value = stats && stats[this.baseStats];
            }
        } else {
            // Use stats from actual column corresponding to this aggregate function
            const stats = metadata.stats(propertyName);
            value = stats && stats[this._name];
        }

        if (value === undefined) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} Metadata ${this._name} for property ${propertyName} is not defined`);
        }

        return value;
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }
}
