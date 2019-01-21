import {
  LAYER_CHANGE_NAME,
  LAYER_CHANGE_OPACITY,
  LAYER_CHANGE_STYLE,
  LAYER_CHANGE_DIMENSION,
  LAYER_DELETE,
  LAYER_FOCUS,
  SERVICE_SET_LAYERS,
  LAYERMANAGER_TOGGLE_LAYERSELECTOR,
  LAYERMANAGER_TOGGLE_STYLESSELECTOR,
  SERVICE_LAYER_SET_STYLES,
  LAYERMANAGER_SET_NUMBER_OF_LAYERS,
  LAYERMANAGER_TOGGLE_OPACITYSELECTOR,
  LAYERMANAGER_MOVE_LAYER,
  LAYER_CHANGE_ENABLED,
  SERVICE_LAYER_SET_DIMENSIONS,
  LAYERMANAGER_SET_TIMERESOLUTION,
  LAYERMANAGER_SET_TIMEVALUE
} from '../constants/action-types';
import { LAYER_MANAGER_EMPTY_LAYER } from '../constants/templates';
import produce from 'immer';
import { generateLayerId, getLayerIndexFromAction, getDimensionIndexFromAction, generateMapId, getMapPanelIndexFromAction } from '../../react-webmapjs/ReactWMJSTools.jsx';

const initialState = {
  activeMapPanelIndex: 0,
  layerManager:{
    layers: [],
    timeResolution: 60,
    timeStart: null,
    timeEnd: null,
    timeValue: null
  },
  webmapjs:{
    services: {},
    mapPanel: [
      {
        id: generateMapId(),
        bbox: [0, 40, 10, 60],
        srs: 'EPSG:4326',
        baseLayers:[{
          service:'http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
          name:'ne_10m_admin_0_countries_simplified',
          format:'image/png',
          keepOnTop:true,
          baseLayer:true,
          id:generateLayerId()
        }
        ],
        layers:[
          {
            service:'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities',
            name:'RADNL_OPER_R___25PCPRR_L3_KNMI',
            opacity:'0.9',
            id:generateLayerId()
          }

        ]
      }, {
        id: generateMapId(),
        baseLayers:[
          {
            service:'http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
            name:'ne_10m_admin_0_countries_simplified',
            format:'image/png',
            keepOnTop:true,
            baseLayer:true,
            id:generateLayerId()
          }
        ],
        layers:[]
      }
    ]
  }
};
const rootReducer = (state = initialState, action = { type:null }) => {
  switch (action.type) {
    case LAYER_CHANGE_NAME:
      return produce(state, draft => { draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[action.payload.layerIndex].name = action.payload.name; });
    case LAYER_CHANGE_ENABLED:
      return produce(state, draft => { draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[action.payload.layerIndex].enabled = action.payload.enabled; });
    case LAYER_CHANGE_OPACITY:
      return produce(state, draft => { draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[action.payload.layerIndex].opacity = action.payload.opacity; });
    case LAYER_CHANGE_STYLE:
      return produce(state, draft => {
        let layerIndex = getLayerIndexFromAction(action, state.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers);
        if (layerIndex === null) return;
        draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[layerIndex].style = action.payload.style;
      });
    case LAYER_CHANGE_DIMENSION:
      return produce(state, draft => {
        let layerIndex = getLayerIndexFromAction(action, state.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers);
        if (layerIndex === null) return;
        const dimensions = draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[layerIndex].dimensions || [];
        let dimensionIndex = getDimensionIndexFromAction(action, dimensions);
        if (dimensionIndex === null) {
          dimensions.push(action.payload.dimension);
        } else {
          dimensions[dimensionIndex] = action.payload.dimension;
        }
        draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[layerIndex].dimensions = dimensions;
      });
    case LAYER_FOCUS:
      console.log('FOCUS');
      return produce(state, draft => {
      });
    case LAYER_DELETE:
      return produce(state, draft => {
        draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers.splice(action.payload.layerIndex, 1);
        draft.layerManager.layers.splice(action.payload.layerIndex, 1);
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
        draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[action.payload.oldIndex] =
          state.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[action.payload.newIndex];
        draft.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[action.payload.newIndex] =
          state.webmapjs.mapPanel[getMapPanelIndexFromAction(action, state.webmapjs.mapPanel)].layers[action.payload.oldIndex];
      });
    case LAYERMANAGER_TOGGLE_LAYERSELECTOR:
      return produce(state, draft => { draft.layerManager.layers[action.payload.layerIndex].layerSelectorOpen = !draft.layerManager.layers[action.payload.layerIndex].layerSelectorOpen; });
    case LAYERMANAGER_SET_TIMERESOLUTION:
      return produce(state, draft => {
        // console.log('timeStart', actio/n.payload.timeStart);
        if (action.payload.timeResolution !== undefined) draft.layerManager.timeResolution = action.payload.timeResolution;
        if (action.payload.timeStart && action.payload.timeStart.isValid()) draft.layerManager.timeStart = action.payload.timeStart;
        if (action.payload.timeEnd && action.payload.timeEnd.isValid()) draft.layerManager.timeEnd = action.payload.timeEnd;
        if (action.payload.timeValue && action.payload.timeValue.isValid()) draft.layerManager.timeValue = action.payload.timeValue;
      });
    case LAYERMANAGER_SET_TIMEVALUE:
      return produce(state, draft => { draft.layerManager.timeValue = action.payload.timeValue; });
    case SERVICE_LAYER_SET_STYLES:
      return produce(state, draft => {
        if (!action.payload.service || !action.payload.name) { return; }
        if (!draft.webmapjs.services[action.payload.service]) draft.webmapjs.services[action.payload.service] = {};
        if (!draft.webmapjs.services[action.payload.service].layer) draft.webmapjs.services[action.payload.service].layer = {};
        if (!draft.webmapjs.services[action.payload.service].layer[action.payload.name]) draft.webmapjs.services[action.payload.service].layer[action.payload.name] = {};
        draft.webmapjs.services[action.payload.service].layer[action.payload.name].styles = action.payload.styles;
      });
    case SERVICE_LAYER_SET_DIMENSIONS:
      return produce(state, draft => {
        if (!action.payload.service || !action.payload.name) { return; }
        if (!draft.webmapjs.services[action.payload.service]) draft.webmapjs.services[action.payload.service] = {};
        if (!draft.webmapjs.services[action.payload.service].layer) draft.webmapjs.services[action.payload.service].layer = {};
        if (!draft.webmapjs.services[action.payload.service].layer[action.payload.name]) draft.webmapjs.services[action.payload.service].layer[action.payload.name] = {};
        let dimensions = [];
        for (let j = 0; j < action.payload.dimensions.length; j++) {
          dimensions.push({
            name: action.payload.dimensions[j].name,
            units: action.payload.dimensions[j].units,
            currentValue: action.payload.dimensions[j].currentValue
          });
        }
        draft.webmapjs.services[action.payload.service].layer[action.payload.name].dimensions = dimensions;
      });
    default:
      return state;
  }
};
export default rootReducer;
