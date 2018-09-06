import * as s from '../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateTypeErrors, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/ordering', () => {
    describe('error control', () => {
        validateTypeErrors('asc', []);
        validateTypeErrors('asc', [undefined]);
        validateTypeErrors('asc', [123]);
        validateTypeErrors('asc', ['number']);
        validateMaxArgumentsError('asc', ['number', 'number']);

        validateTypeErrors('desc', []);
        validateTypeErrors('desc', [undefined]);
        validateTypeErrors('desc', [123]);
        validateTypeErrors('desc', ['number']);
        validateMaxArgumentsError('desc', ['number', 'number']);

        validateMaxArgumentsError('noOrder', ['number']);
    });

    describe('type', () => {
        validateStaticType('asc', [s.width()], 'orderer');
        validateStaticType('desc', [s.width()], 'orderer');
        validateStaticType('noOrder', [], 'orderer');
    });
});
