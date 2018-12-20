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
  LAYERMANAGER_MOVE_LAYER,
  LAYER_CHANGE_ENABLED
} from '../constants/action-types';
import { LAYER_MANAGER_EMPTY_LAYER } from '../constants/templates';
import produce from 'immer';
import { generateLayerId, getLayerIndexFromAction } from '../../react-webmapjs/ReactWMJSTools.jsx';

const initialState = {
  activeMapPanelIndex: 0,
  layerManager:{
    layers:[]
  },
  webmapjs:{
    services: {},
    mapPanel: [
      {
        id: 0,
        bbox: [0, 40, 10, 60],
        srs: 'EPSG:4326',
        baseLayers:[
          {
            service:'https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
            name:'nl_raster_latlon',
            baseLayer:true,
            id:generateLayerId()
          }, {
            service:'https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
            name:'world_line',
            format:'image/png',
            keepOnTop:true,
            baseLayer:true,
            id:generateLayerId()
          }
        ],
        layers:[
          {
            service:'https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
            name:'RADNL_OPER_R___25PCPRR_L3_COLOR',
            opacity:'0.5',
            id:generateLayerId()
          },
          {
            service:'https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
            name:'RADNL_OPER_R___25PCPRR_L3_KNMI',
            opacity:'0.5',
            id:generateLayerId()
          },
          {
            service:'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?',
            name:'air_temperature__at_2m',
            opacity:'0.3',
            id:generateLayerId()
          }
        ]
      }, {
        id: 1,
        baseLayers:[
          {
            service:'https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
            name:'nl_raster_latlon',
            baseLayer:true,
            id:generateLayerId()
          }, {
            service:'https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
            name:'world_line',
            format:'image/png',
            keepOnTop:true,
            baseLayer:true,
            id:generateLayerId()
          }
        ],
        layers:[{
          service:'https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
          name:'RADNL_OPER_R___25PCPRR_L3_COLOR',
          opacity:'0.5',
          id:generateLayerId()
        }]
      }
    ]
  }
};
const rootReducer = (state = initialState, action = { type:null }) => {
  switch (action.type) {
    case LAYER_CHANGE_NAME:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].name = action.payload.name; });
    case LAYER_CHANGE_ENABLED:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].enabled = action.payload.enabled; });
    case LAYER_CHANGE_OPACITY:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].opacity = action.payload.opacity; });
    case LAYER_CHANGE_STYLE:
      return produce(state, draft => {
        let layerIndex = getLayerIndexFromAction(action, state.webmapjs.mapPanel[action.payload.mapPanelIndex].layers);
        if (layerIndex === null) return;
        draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[layerIndex].style = action.payload.style;
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
