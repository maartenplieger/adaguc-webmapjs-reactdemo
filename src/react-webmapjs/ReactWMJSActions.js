import { REACTWMJSMAP_SERVICE_SET_INFORMATION, REACTWMJSMAP_SERVICE_SET_LAYERS, REACTWMJSMAP_SERVICE_LAYER_SET_STYLES, REACTWMJSMAP_LAYER_CHANGE_STYLE } from './ReactWMJSActionTypes.js';
export const setServiceInformation = obj => ({ type: REACTWMJSMAP_SERVICE_SET_INFORMATION, payload: obj });
export const serviceSetLayers = obj => ({ type: REACTWMJSMAP_SERVICE_SET_LAYERS, payload: obj });
export const setStylesInformation = obj => ({ type: REACTWMJSMAP_SERVICE_LAYER_SET_STYLES, payload: obj });
export const layerChangeStyle = obj => ({ type: REACTWMJSMAP_LAYER_CHANGE_STYLE, payload: obj });
