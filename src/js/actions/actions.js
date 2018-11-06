import { ADD_ARTICLE, LAYER_CHANGE_NAME, LAYER_CHANGE_OPACITY, LAYER_CHANGE_STYLE } from "../constants/action-types";
export const addArticle = article => ({ type: ADD_ARTICLE, payload: article });
export const layerChangeName = article => ({ type: LAYER_CHANGE_NAME, payload: article });
export const layerChangeOpacity = article => ({ type: LAYER_CHANGE_OPACITY, payload: article });
export const layerChangeStyle = article => ({ type: LAYER_CHANGE_STYLE, payload: article });