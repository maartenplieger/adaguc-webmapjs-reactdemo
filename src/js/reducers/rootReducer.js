import { ADD_ARTICLE, LAYER_CHANGE_NAME, LAYER_CHANGE_OPACITY, LAYER_CHANGE_STYLE, SERVICE_SET_LAYERS, LAYERMANAGER_TOGGLE_LAYERSELECTOR, LAYERMANAGER_TOGGLE_STYLESSELECTOR, SERVICE_LAYER_SET_STYLES } from "../constants/action-types";
import React, { Component } from 'react';
import ReactWMJSLayer from '../../react-webmapjs/ReactWMJSLayer.jsx';
import produce from "immer"
const initialState = {
  articles: [
    {
      name: 'React Redux Tutorial for Beginners',
      id: 1
    },
    {
      name: 'React Redux Tutorial for Beginners',
      id: 1
    },
    {
      name: 'React Redux Tutorial for Beginners',
      id: 1
    }
  ],
  activeMapPanelIndex: 0,
  layerManager:{
    layers:[{
      layerSelectorOpen:false
    }]
  },
  webmapjs:{
    services: {},
    mapPanel: [
      {
        baseLayers:[
          (<ReactWMJSLayer service="https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?" name="nl_raster_latlon" baseLayer/>),
          (<ReactWMJSLayer service="https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?" name="world_line" format="image/png" keepOnTop baseLayer/>)
        ],
        layers:[
          (<ReactWMJSLayer service="https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?" name="RADNL_OPER_R___25PCPRR_L3_COLOR" opacity="1.0"/>)
        ]
      },
      {
        baseLayers:[
          (<ReactWMJSLayer service="https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?" name="nl_raster_latlon" baseLayer/>),
          (<ReactWMJSLayer service="https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?" name="world_line" format="image/png" keepOnTop baseLayer/>)
        ],
        layers:[
          (<ReactWMJSLayer service="https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?" name="RADNL_OPER_R___25PCPRR_L3_KNMI" opacity="0.5" style="precip-blue/nearest" />)
        ]
      }
    ]
  }
};
const rootReducer = (state = initialState, action = {type:null}) => {
  switch (action.type) {
    case ADD_ARTICLE:
      return { ...state, articles: [...state.articles, action.payload] };
    case LAYER_CHANGE_NAME:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].props.name = action.payload.name; });
    case LAYER_CHANGE_OPACITY:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].props.opacity = action.payload.opacity; });
    case LAYER_CHANGE_STYLE:
      return produce(state, draft => { draft.webmapjs.mapPanel[action.payload.mapPanelIndex].layers[action.payload.layerIndex].props.style = action.payload.style; });
    case SERVICE_SET_LAYERS:
      return produce(state, draft => { 
        if (!draft.webmapjs.services[action.payload.service]) draft.webmapjs.services[action.payload.service] = {};
        draft.webmapjs.services[action.payload.service].layers = action.payload.layers; 
      });
    case LAYERMANAGER_TOGGLE_STYLESSELECTOR:
      return produce(state, draft => { draft.layerManager.layers[action.payload.layerIndex].styleSelectorOpen = !draft.layerManager.layers[action.payload.layerIndex].styleSelectorOpen; });
    case LAYERMANAGER_TOGGLE_LAYERSELECTOR:
      return produce(state, draft => { draft.layerManager.layers[action.payload.layerIndex].layerSelectorOpen = !draft.layerManager.layers[action.payload.layerIndex].layerSelectorOpen; });
    case SERVICE_LAYER_SET_STYLES:
      return produce(state, draft => { 
        if (!action.payload.service || !action.payload.name) {
          console.error('SERVICE_LAYER_SET_STYLES reducer has invalid parameters:', action);
          return;
        }
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