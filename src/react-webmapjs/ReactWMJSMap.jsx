import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'throttle-debounce';
import { WMJSMap, WMJSLayer } from 'adaguc-webmapjs';
import tileRenderSettings from './tilesettings.json';
import ReactWMJSLayer from './ReactWMJSLayer.jsx';
import WMJSGetServiceFromStore from 'adaguc-webmapjs/src/WMJSGetServiceFromStore';
import { serviceSetLayers, layerSetStyles, layerSetDimensions, layerChangeStyle, layerChangeDimension } from '../js/actions/actions';
import { registerWMJSLayer, getWMJSLayerById, registerWMJSMap } from './ReactWMJSTools.jsx';

let xml2jsonrequestURL = 'http://localhost:10000/XML2JSON?';
export default class ReactWMJSMap extends Component {
  constructor (props) {
    super(props);
    this.adaguc = {
      webMapJSCreated:false,
      baseLayers:[]
    };
    this.resize = this.resize.bind(this);
    this._handleWindowResize = this._handleWindowResize.bind(this);
    this.drawDebounced = debounce(600, this.drawDebounced);
    this.checkNewProps = this.checkNewProps.bind(this);
    this.checkAdaguc = this.checkAdaguc.bind(this);
    this.currentWMJSProps = {};
  }
  _handleWindowResize () {
    this.resize();
  }

  drawDebounced () {
    this.adaguc.webMapJS.suspendEvent('onmaploadingcomplete'); // TODO: Should suspend maybe all events
    this.adaguc.webMapJS.draw();
    this.adaguc.webMapJS.resumeEvent('onmaploadingcomplete');
  };

  getWMJSLayerFromReactLayer (wmjsLayers, reactWebMapJSLayer, index) {
    let foundLayer = null;
    if (reactWebMapJSLayer.props.service && reactWebMapJSLayer.props.name && reactWebMapJSLayer.props.id) {
      if (index >= 0 && index < wmjsLayers.length) {
        for (let layerIndex = 0; layerIndex < wmjsLayers.length; layerIndex++) {
          let secondIndex = ((wmjsLayers.length - 1) - index);
          let layer = wmjsLayers[layerIndex];
          if (layer === getWMJSLayerById(reactWebMapJSLayer.props.id)) {
            foundLayer = layer;
            if (layerIndex !== secondIndex) {
              console.log('UPDATE_LAYER: swapping layer indices ', layerIndex, secondIndex);
              this.adaguc.webMapJS.swapLayers(wmjsLayers[layerIndex], wmjsLayers[secondIndex]);
              this.adaguc.webMapJS.draw();
              return { layer: foundLayer, layerArrayMutated: true };
            }
          }
        }
      }
    }
    return { layer: foundLayer, layerArrayMutated: false };
  }

  checkAdaguc () {
    if (this.adaguc.webMapJSCreated) {
      return;
    }
    this.adaguc.webMapJSCreated = true;
    // eslint-disable-next-line no-undef
    this.adaguc.webMapJS = new WMJSMap(this.refs.adagucwebmapjs);
    registerWMJSMap(this.adaguc.webMapJS, this.props.id);
    console.log('new WMJSMAP instance with id [' + this.adaguc.webMapJS.getId() + ']');
    this.adaguc.webMapJS.setBaseURL('./adagucwebmapjs/');
    this.adaguc.webMapJS.setXML2JSONURL(xml2jsonrequestURL);
    this.adaguc.webMapJS.setProjection({ srs:this.props.srs || 'EPSG:3857', bbox:this.props.bbox || [-19000000, -19000000, 19000000, 19000000] });
    this.adaguc.webMapJS.setWMJSTileRendererTileSettings(tileRenderSettings);

    if (this.props.listeners) {
      this.props.listeners.forEach((listener) => {
        this.adaguc.webMapJS.addListener(listener.name, (data) => { listener.callbackfunction(this.adaguc.webMapJS, data); }, listener.keep);
      });
    }

    this.resize();
    // this.componentDidUpdate();
    this.adaguc.webMapJS.draw();

    // TODO: Now the map resizes when the right panel opens, (called via promise at EProfileTest.jsx) that is nice. But this reference is Ugly! How do we see a resize if no event is triggered?
    this.adaguc.webMapJS.handleWindowResize = this._handleWindowResize;

    if (this.props.webMapJSInitializedCallback && this.adaguc.webMapJS) {
      this.props.webMapJSInitializedCallback(this.adaguc.webMapJS, true);
    }
  }

  checkNewProps (props) {
    if (!props) return;
    /* Check children */
    if (props.children) {
      const { children, dispatch } = props;
      if (children !== this.currentWMJSProps.children) {
        this.currentWMJSProps.children = children;
        let wmjsLayers = this.adaguc.webMapJS.getLayers();
        let wmjsBaseLayers = this.adaguc.webMapJS.getBaseLayers();
        let adagucWMJSLayerIndex = 0;
        let adagucWMJSBaseLayerIndex = 0;
        let needsRedraw = false;
        let myChilds = [];
        React.Children.forEach(children, (child, i) => myChilds.push(child));
        myChilds.reverse();
        for (let c = 0; c < myChilds.length; c++) {
          let child = myChilds[c];
          if (child.type) {
            /* Check layers */
            if (typeof child.type === typeof ReactWMJSLayer) {
              if (child.props.baseLayer) {
                let obj = this.getWMJSLayerFromReactLayer(wmjsBaseLayers, child, adagucWMJSBaseLayerIndex);
                if (obj.layerArrayMutated) {
                  this.checkNewProps(props);
                  return;
                }
                let wmjsLayer = obj.layer;
                adagucWMJSBaseLayerIndex++;
                if (wmjsLayer === null) {
                  wmjsLayer = new WMJSLayer({ ...child.props });
                  wmjsLayer.ReactWMJSLayerId = child.props.id;
                  registerWMJSLayer(wmjsLayer, child.props.id);
                  this.adaguc.baseLayers.push(wmjsLayer);
                  wmjsLayer.reactWebMapJSLayer = child;
                  this.adaguc.webMapJS.setBaseLayers(this.adaguc.baseLayers.reverse());
                }
              } else {
                let obj = this.getWMJSLayerFromReactLayer(wmjsLayers, child, adagucWMJSLayerIndex);
                if (obj.layerArrayMutated) {
                  this.checkNewProps(props);
                  return;
                }
                let wmjsLayer = obj.layer;
                adagucWMJSLayerIndex++;
                if (wmjsLayer === null) {
                  wmjsLayer = new WMJSLayer({ ...child.props });
                  registerWMJSLayer(wmjsLayer, child.props.id);
                  wmjsLayer.ReactWMJSLayerId = child.props.id;
                  this.adaguc.webMapJS.addLayer(wmjsLayer);
                  wmjsLayer.reactWebMapJSLayer = child;
                  wmjsLayer.parseLayer((_layer) => {
                    let wmjsLayer = _layer;
                    if (wmjsLayer && wmjsLayer.hasError === false) {
                      if (dispatch) {
                        let service = WMJSGetServiceFromStore(wmjsLayer.service, xml2jsonrequestURL);
                        /* Update list of layers for service */
                        let done = (layers) => {
                          dispatch(serviceSetLayers({ service:wmjsLayer.service, layers:layers }));
                          // /* Update service information in services */
                          // dispatch(setServiceInformation(service));
                          /* Update style information in services for a layer */
                          dispatch(layerSetStyles({ service: wmjsLayer.service, name:wmjsLayer.name, styles:wmjsLayer.getStyles() }));
                          /* Select first style in service for a layer */
                          dispatch(layerChangeStyle({
                            service: wmjsLayer.service,
                            mapPanelId: this.props.id,
                            layerId:wmjsLayer.ReactWMJSLayerId,
                            style:wmjsLayer.getStyles().length > 0 ? wmjsLayer.getStyles()[0].Name.value : 'default'
                          }));
                          /* Update dimensions information in services for a layer */
                          dispatch(layerSetDimensions({ service: wmjsLayer.service, name:wmjsLayer.name, dimensions:wmjsLayer.dimensions }));
                          for (let d = 0; d < wmjsLayer.dimensions.length; d++) {
                            let dimension = {
                              name: wmjsLayer.dimensions[d].name,
                              units: wmjsLayer.dimensions[d].units,
                              currentValue: wmjsLayer.dimensions[d].currentValue
                            };
                            dispatch(layerChangeDimension({
                              service: wmjsLayer.service,
                              mapPanelId: this.props.id,
                              layerId:wmjsLayer.ReactWMJSLayerId,
                              dimension:dimension
                            }));
                          }
                        };
                        service.getLayerObjectsFlat(done);
                      }
                    }
                  }, false, 'ReactWMJSMap.jsx', xml2jsonrequestURL);
                } else {
                  if (child.props.name !== undefined && wmjsLayer.name !== child.props.name) {
                    console.log('UPDATE_LAYER: setting name to [' + child.props.name + ']');
                    wmjsLayer.setName(child.props.name); needsRedraw = true;
                    dispatch(layerSetStyles({ service: wmjsLayer.service, name:wmjsLayer.name, styles:wmjsLayer.getStyles() }));
                    dispatch(layerChangeStyle({ mapPanelId: this.props.id, service: wmjsLayer.service, layerId:wmjsLayer.ReactWMJSLayerId, style:wmjsLayer.getStyles()[0].Name.value }));
                  }
                  if (child.props.opacity !== undefined && parseFloat(wmjsLayer.opacity) !== parseFloat(child.props.opacity)) {
                    console.log('UPDATE_LAYER: setting opacity to [' + child.props.opacity + '] - ' + wmjsLayer.opacity);
                    wmjsLayer.setOpacity(child.props.opacity);
                    needsRedraw = false;
                  }
                  if (child.props.style !== undefined && wmjsLayer.currentStyle !== child.props.style) {
                    console.log('UPDATE_LAYER: setting style to [' + child.props.style + ']');
                    wmjsLayer.setStyle(child.props.style);
                    needsRedraw = true;
                  }
                  if (child.props.enabled !== undefined && wmjsLayer.enabled !== child.props.enabled) {
                    console.log('UPDATE_LAYER: setting enabled to [' + child.props.enabled + ']');
                    wmjsLayer.display(child.props.enabled);
                    needsRedraw = true;
                  }
                  if (child.props.dimensions !== undefined) {
                    for (let d = 0; d < child.props.dimensions.length; d++) {
                      const dim = child.props.dimensions[d];
                      const wmjsDim = wmjsLayer.getDimension(dim.name);
                      if (wmjsDim && wmjsDim.currentValue !== dim.currentValue) {
                        console.log('UPDATE_LAYER: setting dimension to [' + dim.name + '=' + dim.currentValue + ']');
                        wmjsDim.setValue(dim.currentValue);
                        needsRedraw = true;
                      }
                    }
                  }
                }
              }
            }
          }
        };
        if (needsRedraw) {
          this.adaguc.webMapJS.draw();
        }
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    // console.log('shouldComponentUpdate', this.props);
    this.checkNewProps(nextProps);
  }

  componentDidMount () {
    // console.log('componentDidMount', this.props);
    this.checkAdaguc();
    this.checkNewProps(this.props);
    window.addEventListener('resize', this._handleWindowResize);
  }

  componentWillUnmount () {
    // console.log('componentWillUnmount');
    window.removeEventListener('resize', this._handleWindowResize);
    if (this.props.webMapJSInitializedCallback && this.props.layers && this.props.layers.length > 0) {
      this.props.webMapJSInitializedCallback(this.adaguc.webMapJS, false);
    }
    this.adaguc.webMapJS.destroy();
  }
  resize () {
    const element = this.refs.adaguccontainer;
    if (element) {
      const newWidth = element.clientWidth;
      const newHeight = element.clientHeight;
      if (this.currentWidth !== newWidth || this.currentHeight !== newHeight) {
        this.currentWidth = newWidth;
        this.currentHeight = newHeight;
        this.adaguc.webMapJS.setSize(newWidth, newHeight);
      }
    }
  }
  render () {
    return (<div className='ReactWMJSMap'
      style={{ height:'100%', width:'100%', border:'none', display:'block', overflow:'hidden' }} >
      <div ref='adaguccontainer' style={{
        minWidth:'inherit',
        minHeight:'inherit',
        width: 'inherit',
        height: 'inherit',
        overflow: 'hidden',
        display:'block',
        border: 'none'
      }}>
        <div className={'ReactWMJSMapComponent'} >
          <div ref='adagucwebmapjs' />
        </div>
        <div className='ReactWMJSLayerProps'>
          <div>{this.props.children}</div>
        </div>
      </div>
    </div>);
  }
};

ReactWMJSMap.propTypes = {
  layers: PropTypes.array,
  listeners: PropTypes.array,
  bbox: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  webMapJSInitializedCallback: PropTypes.func,
  srs: PropTypes.string,
  children: PropTypes.array,
  id: PropTypes.string.isRequired
};
