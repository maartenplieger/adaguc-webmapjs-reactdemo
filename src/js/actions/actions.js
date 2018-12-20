import { LAYER_CHANGE_NAME,
  LAYER_CHANGE_OPACITY,
  LAYER_CHANGE_STYLE,
  LAYER_CHANGE_DIMENSION,
  SERVICE_SET_LAYERS,
  LAYERMANAGER_TOGGLE_LAYERSELECTOR,
  LAYERMANAGER_TOGGLE_STYLESSELECTOR,
  SERVICE_LAYER_SET_STYLES,
  LAYERMANAGER_SET_NUMBER_OF_LAYERS,
  LAYERMANAGER_TOGGLE_OPACITYSELECTOR,
  LAYERMANAGER_MOVE_LAYER,
  LAYER_CHANGE_ENABLED,
  SERVICE_LAYER_SET_DIMENSIONS
} from '../constants/action-types';
export const layerChangeName = obj => ({ type: LAYER_CHANGE_NAME, payload: obj });
export const layerChangeOpacity = obj => ({ type: LAYER_CHANGE_OPACITY, payload: obj });
export const layerChangeStyle = obj => ({ type: LAYER_CHANGE_STYLE, payload: obj });
export const layerChangeDimension = obj => ({ type: LAYER_CHANGE_DIMENSION, payload: obj });
export const layerChangeEnabled = obj => ({ type: LAYER_CHANGE_ENABLED, payload: obj });
export const serviceSetLayers = obj => ({ type: SERVICE_SET_LAYERS, payload: obj });
export const layerManagerToggleLayerSelector = obj => ({ type: LAYERMANAGER_TOGGLE_LAYERSELECTOR, payload: obj });
export const layerManagerToggleStylesSelector = obj => ({ type: LAYERMANAGER_TOGGLE_STYLESSELECTOR, payload: obj });
export const layerManagerToggleOpacitySelector = obj => ({ type: LAYERMANAGER_TOGGLE_OPACITYSELECTOR, payload: obj });
export const layerManagerSetNumberOfLayers = obj => ({ type: LAYERMANAGER_SET_NUMBER_OF_LAYERS, payload: obj });
export const layerManagerMoveLayer = obj => ({ type: LAYERMANAGER_MOVE_LAYER, payload: obj });
export const layerSetStyles = obj => ({ type: SERVICE_LAYER_SET_STYLES, payload: obj });
export const layerSetDimensions = obj => ({ type: SERVICE_LAYER_SET_DIMENSIONS, payload: obj });
