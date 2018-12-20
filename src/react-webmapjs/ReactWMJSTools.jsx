var generatedLayerIds = 0;
export const generateLayerId = () => {
  generatedLayerIds++;
  return 'layerid_' + generatedLayerIds;
};

var generatedMapIds = 0;
export const generateMapId = () => {
  generatedMapIds++;
  return 'mapid_' + generatedMapIds;
};

export const getLayerIndexFromAction = (action, layers) => {
  if (!action.payload.layerId) {
    console.log(action);
    console.warn(action.type + ': invalid action payload, layerId is missing');
    return null;
  }
  let layerIndex = layers.findIndex(layer => layer.id === action.payload.layerId);
  if (layerIndex === -1) {
    console.warn(action.type + ': layerId ' + action.payload.layerId + ' not found');
    return null;
  }
  return layerIndex;
};
