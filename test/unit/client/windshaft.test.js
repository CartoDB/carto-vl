import Windshaft from '../../../src/client/windshaft';
import Viz from '../../../src/Viz';

const base = {
    _apiKey: '1234',
    _username: 'wadus',
    _serverURL: 'https://wadus.carto.com',
    _getFromClause: () => 'table_name'
};

const vizMock = `
    width: 4
    color: ramp(linear(abs($accel_lateral), 0, 1), temps)
    strokeWidth: 0
    filter: $lap == 24 and animation(linear($date), 20, fade(0, 1))
`;

const MNSMock = {
    'accel_lateral': [
        {
            'type': 'unaggregated'
        }
    ],
    'lap': [
        {
            'type': 'unaggregated'
        }
    ],
    'date': [
        {
            'type': 'unaggregated'
        },
        {
            'type': 'unaggregated'
        },
        {
            'type': 'unaggregated'
        }
    ],
    'cartodb_id': [
        {
            'type': 'unaggregated'
        }
    ]
};

const resolutionMock = 1;

const filteringMock = {
    'preaggregation': {
        'type': 'equals',
        'left': {
            'type': 'property',
            'property': 'lap'
        },
        'right': {
            'type': 'value',
            'value': 24
        }
    },
    'aggregation': {}
};

const vizInfoMock = {
    'MNS': MNSMock,
    'resolution': resolutionMock,
    'filtering': filteringMock
};

const metadataMock = {
    'properties': [],
    'featureCount': 3000000,
    'backendFiltersApplied': true
};

const urlTemplatesMock = 'url_templates_mock';

const instantiationDataMock = {
    'MNS': MNSMock,
    'resolution': resolutionMock,
    'filtering': filteringMock,
    'metadata': metadataMock,
    'urlTemplates': urlTemplatesMock
};

// TODO: add more tests to cover all Windshaft functions

describe('src/client/windshaft', () => {
    let client;

    beforeEach(() => {
        client = new Windshaft(base);
        // Mock fetch function
        client._getInstantiationPromise = () => ({
            metadata: metadataMock,
            urlTemplates: urlTemplatesMock
        });
    });

    describe('_getServerInfoFrom', () => {
        it('should convert viz into vizInfo', () => {
            const viz = new Viz(vizMock);
            const vizInfo = client._getServerInfoFrom(viz);
            expect(vizInfo).toEqual(vizInfoMock);
        });
    });

    describe('_needToInstantiateMap', () => {
        describe('at the beginning', () => {
            it('should detect that it requires instantiation', () => {
                const _needToInst = client._needToInstantiateMap(vizInfoMock);
                expect(_needToInst).toEqual(true);
            });
        });

        describe('after an update', () => {
            beforeEach(() => {
                client._updateStateAfterInstantiating({ ...instantiationDataMock });
            });

            it('should detect that it does not require instantiation', () => {
                const _needToInst = client._needToInstantiateMap(vizInfoMock);
                expect(_needToInst).toEqual(false);
            });

            it('should detect that it requires instantiation when MNS has changed', () => {
                const _vizInfoMock = { ...vizInfoMock };
                _vizInfoMock.MNS = {};
                const _needToInst = client._needToInstantiateMap(_vizInfoMock);
                expect(_needToInst).toEqual(true);
            });

            it('should detect that it requires instantiation when resolution has changed', () => {
                const _vizInfoMock = { ...vizInfoMock };
                _vizInfoMock.resolution = 2;
                const _needToInst = client._needToInstantiateMap(_vizInfoMock);
                expect(_needToInst).toEqual(true);
            });

            it('should detect that it requires instantiation when filtering has changed', () => {
                const _vizInfoMock = { ...vizInfoMock };
                _vizInfoMock.filtering = {};
                const _needToInst = client._needToInstantiateMap(_vizInfoMock);
                expect(_needToInst).toEqual(true);
            });
        });
    });

    describe('_instantiateUncached', () => {
        it('should detect backend filtering flag', async () => {
            const _instantiationData = await client._instantiateUncached(vizInfoMock);
            expect(_instantiationData).toEqual(instantiationDataMock);
        });
    });

    describe('_updateStateAfterInstantiating', () => {
        it('should update client properties from the instance data', () => {
            expect(client._MNS).toEqual(null);
            expect(client.filtering).toEqual(undefined);
            expect(client.resolution).toEqual(undefined);
            expect(client.metadata).toEqual(undefined);
            expect(client.urlTemplates).toEqual(undefined);

            client._updateStateAfterInstantiating({ ...instantiationDataMock });

            expect(client._MNS).toEqual(MNSMock);
            expect(client.filtering).toEqual(filteringMock);
            expect(client.resolution).toEqual(resolutionMock);
            expect(client.metadata).toEqual(metadataMock);
            expect(client.urlTemplates).toEqual(urlTemplatesMock);
        });
    });
});
