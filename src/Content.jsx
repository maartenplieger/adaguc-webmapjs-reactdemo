import React, { Component } from 'react';
import { connect } from "react-redux";
import { addArticle } from './js/actions/actions.js';
import WMJSMap from './react-webmapjs/ReactWMJSMap.jsx';
import WMJSLayer from './react-webmapjs/ReactWMJSLayer.jsx';
import WMJSTiledLayer from './react-webmapjs/ReactWMJSDimension.jsx';
import GeoJSONLayer from './react-webmapjs/ReactWMJSDimension.jsx';
import { WMJSDimension, WMJSGetServiceFromStore } from 'adaguc-webmapjs';

class Content extends Component {
    constructor (props) {
      super(props);
    }
    render () {
        const { mapPanel } = this.props;
        return (
            <div style={{width:'100%', height:'100%'}}>
            <div style={{width:'50%', height:'100%', display:'inline-block'}}>
                <WMJSMap bbox={[0,40,10,60]} srs={'EPSG:4326'} >
                    { mapPanel[0].baseLayers.map((layer,i) => { return <WMJSLayer key={i} {...layer.props} />;}) }
                    { mapPanel[0].layers.map((layer,i) => { return <WMJSLayer key={i} {...layer.props} />;}) }
                </WMJSMap>
            </div>
            <div style={{width:'50%', height:'100%', display:'inline-block'}}>
            <WMJSMap bbox={[0,40,10,60]} srs={'EPSG:4326'} >
                { mapPanel[1].baseLayers.map((layer,i) => { return <WMJSLayer key={i} {...layer.props} />;}) }
                { mapPanel[1].layers.map((layer,i) => { return <WMJSLayer key={i} {...layer.props} />;}) }
            </WMJSMap>
        </div>
        </div>
        );
    }
};

const mapStateToProps = state => {
    return { mapPanel: state.mapPanel };
};

export default connect(mapStateToProps)(Content);

