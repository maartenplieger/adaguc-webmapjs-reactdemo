import React, { Component } from 'react';
import { connect } from "react-redux";
import { addArticle } from './js/actions/actions.js';
import ReactWMJSMap from './react-webmapjs/ReactWMJSMap.jsx';
import ReactWMJSLayer from './react-webmapjs/ReactWMJSLayer.jsx';
import WMJSTiledLayer from './react-webmapjs/ReactWMJSDimension.jsx';
import GeoJSONLayer from './react-webmapjs/ReactWMJSDimension.jsx';
import { WMJSDimension, WMJSGetServiceFromStore } from 'adaguc-webmapjs';
import { serviceSetLayers, layerSetStyles } from './js/actions/actions.js';

class Content extends Component {
    constructor (props) {
      super(props);
    }
    render () {
        const { mapPanel, dispatch } = this.props;
        let mapPanelDispatch = (action,mapPanelIndex) => {
          
          switch(action.type) {
            case 'SERVICE_SET_LAYERS':
              dispatch(serviceSetLayers({service:action.payload.service, layers: action.payload.layers}));
            break;
            case 'SERVICE_LAYER_SET_STYLES':
              dispatch(layerSetStyles({service:action.payload.service, name: action.payload.name,styles: action.payload.styles}));
            break;
            default:
              console.log('Unhandled action type', action.type);
          }
          
        };
        return (
            <div style={{width:'100%', height:'100%'}}>
            <div style={{width:'50%', height:'100%', display:'inline-block'}}>
                <ReactWMJSMap bbox={[0,40,10,60]} srs={'EPSG:4326'} dispatch={(action) => {mapPanelDispatch(action,0);}} >
                    { mapPanel[0].baseLayers.map((layer,i) => { return <ReactWMJSLayer key={i} {...layer.props} />;}) }
                    { mapPanel[0].layers.map((layer,i) => { return <ReactWMJSLayer key={i} {...layer.props} />;}) }
                </ReactWMJSMap>
            </div>
            <div style={{width:'50%', height:'100%', display:'inline-block'}}>
            <ReactWMJSMap bbox={[0,40,10,60]} srs={'EPSG:4326'}  dispatch={(action) => {mapPanelDispatch(action,1);}} >
                { mapPanel[1].baseLayers.map((layer,i) => { return <ReactWMJSLayer key={i} {...layer.props} />;}) }
                { mapPanel[1].layers.map((layer,i) => { return <ReactWMJSLayer key={i} {...layer.props} />;}) }
            </ReactWMJSMap>
        </div>
        </div>
        );
    }
};

const mapStateToProps = state => {
    return { mapPanel: state.webmapjs.mapPanel };
};

export default connect(mapStateToProps)(Content);

