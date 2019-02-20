import CartoRuntimeError from '../src/errors/carto-runtime-error';

/**
 * Helper to manage concurrent updates to a Layer.
 *
 * There are 2 type of changes in a layer's source or viz:
 *      - Major changes. Major changes are performed by the `Layer.update` method and they will override (have priority over) minor changes
 *      - Minor changes. Minor changes are performed by the `Layer.blendToViz` and `blendTo` method and they won't override concurrent calls to `Layer.update`
 *
 * @export
 * @class LayerConcurrency
 */
export default class LayerConcurrencyHelper {
    constructor () {
        this._majorNextUID = 0;
        this._majorCurrentUID = null;
        this._minorNextUID = 0;
        this._minorCurrentUID = null;
    }

    /**
     * Init a Major change
     *
     * @returns {Object} changeUID
     */
    initMajorChange () {
        return this._getChangeUID(true);
    }

    /**
     * Init a Minor change
     *
     * @returns {Object} changeUID
     */
    initMinorChange () {
        return this._getChangeUID(false);
    }

    /**
     * End a Major change, checking previously for concurrency problems
     *
     * @param {Object} changeUID
     */
    endMajorChange (changeUID) {
        this._detectConcurrentChanges(true, changeUID);
        this._setUID(changeUID);
    }

    /**
     * End a Minor change, checking previously for concurrency problems
     *
     * @param {Object} changeUID
     */
    endMinorChange (changeUID) {
        this._detectConcurrentChanges(false, changeUID);
        this._setUID(changeUID);
    }

    /**
     * Get an object with UID counters, that serve as a guard against concurrent changes
     * @param {Boolean} majorChange
     */
    _getChangeUID (majorChange) {
        let uid;
        if (majorChange) {
            uid = { major: this._majorNextUID, minor: 0 };
            this._majorNextUID++;
            this._minorNextUID = 1;
        } else {
            uid = { major: this._majorCurrentUID, minor: this._minorNextUID };
            this._minorNextUID++;
        }
        return uid;
    }

    /**
     * Check against concurrency problems (raise an error if any is found)
     * @param {Boolean} majorChange
     * @param {Object} changeUID
     */
    _detectConcurrentChanges (majorChange, changeUID) {
        if (majorChange) {
            if (this._majorCurrentUID > changeUID.major) {
                throw new CartoRuntimeError(`Another \`Layer.update()\` finished before this one:
                 Commit ${changeUID} overridden by commit ${this._majorCurrentUID}.`);
            }
        } else {
            if (this._majorCurrentUID > changeUID.major || (this._majorCurrentUID !== null && changeUID.major === null)) {
                throw new CartoRuntimeError(`Another \`Layer.update()\` finished before this viz change:
                 Commit ${changeUID} overridden by commit ${this._majorCurrentUID}.${this._minorCurrentUID}`);
            }
            if (this._minorCurrentUID > changeUID.minor) {
                throw new CartoRuntimeError(`Another \`viz change\` finished before this one:
                 Commit ${changeUID.major}.${changeUID.minor} overridden by commit ${this._majorCurrentUID}.${this._minorCurrentUID}`);
            }
        }
    }

    /**
     * Update internal counters
     *
     * @param {Object} changeUID
     */
    _setUID (changeUID) {
        this._majorCurrentUID = changeUID.major;
        this._minorCurrentUID = changeUID.minor;
    }
}
