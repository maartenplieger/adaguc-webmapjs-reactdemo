import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactWMJSMap from './react-webmapjs/ReactWMJSMap.jsx';
import ReactWMJSLayer from './react-webmapjs/ReactWMJSLayer.jsx';

class Content extends Component {
  render () {
    const { mapPanel, dispatch } = this.props;
    return (
      <div style={{ width:'100%', height:'100%' }}>
        <div style={{ width:'50%', height:'100%', display:'inline-block' }}>
          <ReactWMJSMap dispatch={dispatch} {...mapPanel[0]} >
            { mapPanel[0].baseLayers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
            { mapPanel[0].layers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
          </ReactWMJSMap>
        </div>
        <div style={{ width:'50%', height:'100%', display:'inline-block' }}>
          <ReactWMJSMap dispatch={dispatch} {...mapPanel[1] } >
            { mapPanel[1].baseLayers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
            { mapPanel[1].layers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
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
