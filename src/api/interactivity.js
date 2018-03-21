import Layer from './layer';

export default class Interactivity {
    constructor (layerList){
        checkLayerList(layerList);
        this._layerList = layerList;
    }
    on(eventName, callback){
    }
    off(eventName, callback){
        
    }
}

function checkLayerList(layerList){
    if (!Array.isArray(layerList)){
        throw new Error('Invalid layer list, parameter must be an array of carto.Layer objects');        
    }
    if (!layerList.length){
        throw new Error('Invalid argument, layer list must not be empty');
    }
    layerList.forEach(layer => {
        if (!(layer instanceof Layer)){
            throw new Error('Invalid layer, layer must be an instance of carto.Layer');
        }
    });
}
