
import Dataframe from '../../../src/core/dataframe';

export const dataframe = new Dataframe({
    center: { x: 0, y: 0 },
    scale: 1,
    geom: [
        0, 0,
        1, 1
    ],
    properties: {
        id: [1, 2],
        cartodb_id: [0, 1]
    },
    type: 'point',
    size: 2,
    active: true,
    metadata: {
        columns: [{
            name: 'id',
            type: 'number'
        },
        {
            name: 'cartodb_id',
            type: 'number'
        }]
    }
});

export const viz = {
    width: { eval: () => 0.5 },
    strokeWidth: { eval: () => 0.5 },
    filter: { eval: () => 1. },
};

dataframe.renderer = { _zoom: 1, gl: { canvas: { clientHeight: 1024 } } };
