import * as s from '../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateStaticTypeErrors, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/ordering', () => {
    describe('error control', () => {
        validateStaticTypeErrors('asc', []);
        validateStaticTypeErrors('asc', [undefined]);
        validateStaticTypeErrors('asc', [123]);
        validateStaticTypeErrors('asc', ['number']);
        validateMaxArgumentsError('asc', ['number', 'number']);

        validateStaticTypeErrors('desc', []);
        validateStaticTypeErrors('desc', [undefined]);
        validateStaticTypeErrors('desc', [123]);
        validateStaticTypeErrors('desc', ['number']);
        validateMaxArgumentsError('desc', ['number', 'number']);

        validateMaxArgumentsError('noOrder', ['number']);
    });

    describe('type', () => {
        validateStaticType('asc', [s.width()], 'orderer');
        validateStaticType('desc', [s.width()], 'orderer');
        validateStaticType('noOrder', [], 'orderer');
    });
});
