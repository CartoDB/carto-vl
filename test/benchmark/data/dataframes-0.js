
import Dataframe from '../../../src/renderer/Dataframe';

export const dataframe = new Dataframe({
    center: { x: 0, y: 0 },
    scale: 1,
    geom: [
        0, 0,
        1, 1
    ],
    properties: {
        id: [1, 2]
    },
    type: 'point',
    size: 2,
    active: true,
    metadata: {
        properties: {
            id: {
                type: 'number'
            }
        }
    }
});

export const viz = {
    width: { eval: () => 0.5 },
    strokeWidth: { eval: () => 0.5 },
    filter: { eval: () => 1.0 },
    symbol: {_default: true}
};

dataframe.renderer = { _zoom: 1, gl: { canvas: { clientHeight: 1024 } } };
