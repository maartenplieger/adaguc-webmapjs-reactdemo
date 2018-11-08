import { SERVICE_SET_INFORMATION, SERVICE_SET_LAYERS, SERVICE_LAYER_SET_STYLES } from './ReactWMJSActionTypes.js';
export const setServiceInformation = obj => ({ type: SERVICE_SET_INFORMATION, payload: obj });
export const serviceSetLayers = obj => ({ type: SERVICE_SET_LAYERS, payload: obj });
export const setStylesInformation = obj => ({ type: SERVICE_LAYER_SET_STYLES, payload: obj });
