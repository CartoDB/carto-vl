import * as s from '../../../../../src/core/style/functions';
import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/category', () => {
    describe('error control', () => {
        validateStaticTypeErrors('asc', []);
        validateStaticTypeErrors('asc', [undefined]);
        validateStaticTypeErrors('asc', [123]);
        validateStaticTypeErrors('asc', ['float']);

        validateStaticTypeErrors('desc', []);
        validateStaticTypeErrors('desc', [undefined]);
        validateStaticTypeErrors('desc', [123]);
        validateStaticTypeErrors('desc', ['float']);
    });

    describe('type', () => {
        validateStaticType('asc', [s.width()], 'orderer');
        validateStaticType('desc', [s.width()], 'orderer');
        validateStaticType('noOrder', [], 'orderer');
    });

});


