import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactWMJSMap from './react-webmapjs/ReactWMJSMap.jsx';
import ReactWMJSLayer from './react-webmapjs/ReactWMJSLayer.jsx';
import { webMapJSReducer, WEBMAPJS_REDUCERNAME } from './react-webmapjs/ReactWMJSReducer';
class Content extends Component {
  constructor (props) {
    super(props);
    console.log('Adding reducer');
    window.reducerManager.add(WEBMAPJS_REDUCERNAME, webMapJSReducer);
  }
  render () {
    const { mapPanel, dispatch } = this.props;
    if (!mapPanel) return null;
    return (
      <div style={{ width:'100%', height:'100%' }}>
        <div style={{ width:'100%', height:'100%', display:'inline-block' }}>
          <ReactWMJSMap dispatch={dispatch} {...mapPanel[0]} >
            { mapPanel[0].baseLayers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
            { mapPanel[0].layers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
          </ReactWMJSMap>
        </div>
        <div style={{ width:'0%', height:'100%', display:'inline-block' }}>
          <ReactWMJSMap dispatch={dispatch} {...mapPanel[1]} >
            { mapPanel[1].baseLayers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
            { mapPanel[1].layers.map((layer, i) => { return <ReactWMJSLayer key={i} {...layer} />; }) }
          </ReactWMJSMap>
        </div>
      </div>
    );
  }
};

Content.propTypes = {
  mapPanel: PropTypes.array.isRequired,
  dispatch: PropTypes.func
};

const mapStateToProps = state => {
  /* Return initial state if not yet set */
  const webMapJSState = state[WEBMAPJS_REDUCERNAME] ? state[WEBMAPJS_REDUCERNAME] : webMapJSReducer();
  return { mapPanel: webMapJSState.webmapjs.mapPanel };
};

export default connect(mapStateToProps)(Content);
