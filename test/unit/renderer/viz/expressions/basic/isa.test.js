import * as s from '../../../../../../src/renderer/viz/expressions';
import Property from '../../../../../../src/renderer/viz/expressions/basic/property';
import Number from '../../../../../../src/renderer/viz/expressions/basic/number';

describe('isA', () => {
    it('should detect expression type directly', () => {
        const propExpr = s.property('xyz');
        const numbExpr = s.number(11);
        expect(propExpr.isA(Property)).toEqual(true);
        expect(propExpr.isA(Number)).toEqual(false);
        expect(numbExpr.isA(Property)).toEqual(false);
        expect(numbExpr.isA(Number)).toEqual(true);
    });

    it('should detect expression type through variables', () => {
        const propExpr = s.property('xyz');
        const numbExpr = s.number(11);
        const propVar = s.variable('vprop');
        const numbVar = s.variable('vnumb');
        propVar._resolveAliases({ vprop: propExpr });
        numbVar._resolveAliases({ vnumb: numbExpr });

        expect(propVar.isA(Property)).toEqual(true);
        expect(propVar.isA(Number)).toEqual(false);
        expect(numbVar.isA(Property)).toEqual(false);
        expect(numbVar.isA(Number)).toEqual(true);
    });
});
