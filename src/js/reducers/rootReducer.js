import {
  LAYER_CHANGE_NAME,
  LAYER_CHANGE_OPACITY,
  LAYER_CHANGE_STYLE,
  SERVICE_SET_LAYERS,
  LAYERMANAGER_TOGGLE_LAYERSELECTOR,
  LAYERMANAGER_TOGGLE_STYLESSELECTOR,
  SERVICE_LAYER_SET_STYLES,
  LAYERMANAGER_SET_NUMBER_OF_LAYERS,
  LAYERMANAGER_TOGGLE_OPACITYSELECTOR,
  LAYERMANAGER_MOVE_LAYER
} from '../constants/action-types';
import { LAYER_MANAGER_EMPTY_LAYER } from '../constants/templates';
import React from 'react';
import ReactWMJSLayer from '../../react-webmapjs/ReactWMJSLayer.jsx';
import produce from 'immer';

var generatedLayerIds = 0;
const generateLayerId = () => {
  generatedLayerIds++;
  return 'layerid_' + generatedLayerIds;
};

const initialState = {
  activeMapPanelIndex: 0,
  layerManager:{
    layers:[]
  },
  webmapjs:{
    services: {},
    mapPanel: [
      {
        baseLayers:[
          (<ReactWMJSLayer service='https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?' name='nl_raster_latlon' baseLayer id={generateLayerId()} />),
          (<ReactWMJSLayer service='https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?' name='world_line' format='image/png' keepOnTop baseLayer id={generateLayerId()} />)
        ],
        layers:[
          (<ReactWMJSLayer service='https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?' name='RADNL_OPER_R___25PCPRR_L3_COLOR' opacity='0.5' id={generateLayerId()} />),
          (<ReactWMJSLayer service='https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?'
            name='RADNL_OPER_R___25PCPRR_L3_KNMI' style='precip/nearest' opacity='0.9' id={generateLayerId()} />),
          (<ReactWMJSLayer service='http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?' name='air_temperature__at_2m' opacity='0.3' id={generateLayerId()} />)
        ]
      }, {
        baseLayers:[
          (<ReactWMJSLayer service='https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?' name='nl_raster_latlon' baseLayer id={generateLayerId()} />),
          (<ReactWMJSLayer service='https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?' name='world_line' format='image/png' keepOnTop baseLayer id={generateLayerId()} />)
        ],
        layers:[
          (<ReactWMJSLayer service='https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?' name='RADNL_OPER_R___25PCPRR_L3_KNMI' opacity='0.5' style='precip/nearest'
            id={generateLayerId()} />)
        ]
      }
    ]
  }
};
const rootReducer = (state = initialState, action = { type:null }) => {
  switch (action.type) {
    case LAYER_CHANGE_NAME:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].props.name = action.payload.name; });
    case LAYER_CHANGE_OPACITY:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].props.opacity = action.payload.opacity; });
    case LAYER_CHANGE_STYLE:
      return produce(state, draft => {
        if (action.payload.layerIndex >= state.webmapjs.mapPanel[action.payload.mapPanelIndex].layers.length) {
          return;
        }
        if (!draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex]) return;
        draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].props.style = action.payload.style;
      });
    case SERVICE_SET_LAYERS:
      return produce(state, draft => {
        if (!draft.webmapjs.services[action.payload.service]) draft.webmapjs.services[action.payload.service] = {};
        draft.webmapjs.services[action.payload.service].layers = action.payload.layers;
      });
    case LAYERMANAGER_TOGGLE_OPACITYSELECTOR:
      return produce(state, draft => { draft.layerManager.layers[action.payload.layerIndex].opacitySelectorOpen = !draft.layerManager.layers[action.payload.layerIndex].opacitySelectorOpen; });
    case LAYERMANAGER_TOGGLE_STYLESSELECTOR:
      return produce(state, draft => { draft.layerManager.layers[action.payload.layerIndex].styleSelectorOpen = !draft.layerManager.layers[action.payload.layerIndex].styleSelectorOpen; });
    case LAYERMANAGER_SET_NUMBER_OF_LAYERS:
      return produce(state, draft => {
        draft.layerManager.layers.length = 0;
        for (let j = 0; j < action.payload; j++) {
          draft.layerManager.layers.push(LAYER_MANAGER_EMPTY_LAYER);
        }
      });
    case LAYERMANAGER_MOVE_LAYER:
      return produce(state, draft => {
        draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.oldIndex] = state.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.newIndex];
        draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.newIndex] = state.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.oldIndex];
      });
    case LAYERMANAGER_TOGGLE_LAYERSELECTOR:
      return produce(state, draft => { draft.layerManager.layers[action.payload.layerIndex].layerSelectorOpen = !draft.layerManager.layers[action.payload.layerIndex].layerSelectorOpen; });
    case SERVICE_LAYER_SET_STYLES:
      return produce(state, draft => {
        if (!action.payload.service || !action.payload.name) { return; }
        if (!draft.webmapjs.services[action.payload.service]) draft.webmapjs.services[action.payload.service] = {};
        if (!draft.webmapjs.services[action.payload.service].layer) draft.webmapjs.services[action.payload.service].layer = {};
        if (!draft.webmapjs.services[action.payload.service].layer[action.payload.name]) draft.webmapjs.services[action.payload.service].layer[action.payload.name] = {};
        draft.webmapjs.services[action.payload.service].layer[action.payload.name].styles = action.payload.styles;
      });
    default:
      return state;
  }
};
export default rootReducer;
