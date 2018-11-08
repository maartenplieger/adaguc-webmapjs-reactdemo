import { LAYER_CHANGE_NAME, LAYER_CHANGE_OPACITY, LAYER_CHANGE_STYLE, SERVICE_SET_LAYERS, LAYERMANAGER_TOGGLE_LAYERSELECTOR, LAYERMANAGER_TOGGLE_STYLESSELECTOR, SERVICE_LAYER_SET_STYLES } from "../constants/action-types";
export const layerChangeName = obj => ({ type: LAYER_CHANGE_NAME, payload: obj });
export const layerChangeOpacity = obj => ({ type: LAYER_CHANGE_OPACITY, payload: obj });
export const layerChangeStyle = obj => ({ type: LAYER_CHANGE_STYLE, payload: obj });
export const serviceSetLayers = obj => ({ type: SERVICE_SET_LAYERS, payload: obj });
export const layerManagerToggleLayerSelector = obj => ({ type: LAYERMANAGER_TOGGLE_LAYERSELECTOR, payload: obj });
export const layerManagerToggleStylesSelector = obj => ({ type: LAYERMANAGER_TOGGLE_STYLESSELECTOR, payload: obj });
export const layerSetStyles = obj => ({ type: SERVICE_LAYER_SET_STYLES, payload: obj });
