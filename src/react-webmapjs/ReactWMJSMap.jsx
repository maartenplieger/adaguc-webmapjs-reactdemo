import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'throttle-debounce';
import { WMJSMap, WMJSLayer } from 'adaguc-webmapjs';
import tileRenderSettings from './tilesettings.json'
import ReactWMJSLayer from './ReactWMJSLayer.jsx';
import WMJSGetServiceFromStore from 'adaguc-webmapjs/src/WMJSGetServiceFromStore';
import { setServiceInformation,serviceSetLayers, setStylesInformation } from './ReactWMJSActions.js';

/* Maarten Plieger, 2018-06-03 @ ReactWebMapJS:

  Please NOTE: Correct design of ReactWebMapJS is critical.
    ADAGUC WebMapJS is wrapped inside ReactWebMapJS, but the original ADAGUC WebMapJS was never designed to be a React component.
    If you are not careful, you will get strange behavior and conflicts with ReactJS vs WebMapJS
    Read the following to understand why!

  Updating ADAGUC WebMapJS props ReactWMJSMapa React props
    If you want to change WebMapJReactWMJSMapprops via React component props, NEVER return true from the shouldComponentUpdate method.
    Instead, detect which props iReactWMJSMapthe component are changed and set the prop with the right API call in WebMapJS.
    If you want to use React propReactWMJSMapto change WebMapJS props, detect it in shouldComponentUpdate, set it in WebMapJS, and return false to prevent re-rendering.

  You may ask, why is that!?
    React keeps a shadow DOM in mReactWMJSMapory, it will compare this to the browser DOM and update/re-render where necessary when props update or state changes.
    React components are normally re-rendered in the DOM when props change, there is a lot of smartness and logic behind to do this efficiently.
    With React, browsers DOM elements are removed and added all the time or not even touched at all.
    React/Redux can even re-render a whole page from scratch if you keep the Redux state right. These are things difficult to achieve with jQuery or ExtJS.
    Frameworks like jQuery and ExtJS want to keep things in the browsers DOM more permanently for a longer period.
    jQuery and ExtJS allow you to update the browsers DOM at the specified location, it does not touch anything else if you are not telling it to do so.
    WebMapJS is a component which likes to reside more permanently in the DOM as well. It is designed to work with JQuery or ExtJS.
    WebMapJS does a lot of heavy initialization when rendered and does small DOM updates by itself when props change.
    After WebMapJS is initialized it is really efficient in updates, despite its expensive initialization. This means that you do not want to re-render ADAGUC WebMapJS too often!
    Instead, WebMapJS is designed to be updated via its API calls, which are handled efficiently inside WebMapJS.
    React works in a different way, its flow is different.
    When you are using React, you should be careful with manipulating the browsers DOM directly. If you are not careful, React will get confused, or you will get confused.

  So what will happen if you change the bbox via the components props and return true on shouldComponentUpdate?
    When the bbox prop is set, it will trigger a re-render, which means that it will rerender the whole ADAGUC WebMapJS.
    Keep in mind that bbox updates can occur with high frequencies, > 60fps is possible if you drag the map with a mouse for example.
    You might not want to re-render things in the DOM at this speed anyway.
    On a zoom or bbox update, you do not want to rerender the whole viewer and trigger an initialization. This is very heavy and causes side effects (flickering, event storms).
    Most importantly you do not want to use WebMapJS in the wrong way, as you are loosing its efficiency in that case.
    BBOX updates should be handled efficiently and not cause a high load, because it will result in a poor UI experience. E.g. Leave it to WebMapJS!
    If you really want to change WebMapJS props via React props, return false shouldComponentUpdate. Set the prop with the right API call in WebMapJS. And return false to prevent a re-render.
    You will note that setting things via React Props will make the UI more sluggish as ReactJS does optimizations, debounces and other stuffs.
    And the think of the fact that the React component itself does not do anything by default with the prop info anyway, therefore a bit of a waste!!

  Some notes on WebMapJS.draw() and WebMapJS.setBBOX():
    WebMapJS.setBBOX() will visibly change the maps extent but not load anything.
    WebMapJS.draw() will load new data if needed, use this one carefully and not too often.
  Interesting reads: "React at 60fps": https://hackernoon.com/react-at-60fps-4e36b8189a4c
    Checkout its conclusion :D .(Setting things via props for DOM changes is not always the preferred way)
    This is way I am not shy to pass WebMapJS instances back and expose its API to places where it is needed.
    Nevertheless, people used to React expect to set everything with React Props.
*/
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

  // shouldComponentUpdate (nextProps, nextState) {
  //   console.log('shouldComponentUpdate');
  //   if (this.props.layers) {
  //     if (this.props.layers.length !== nextProps.layers.length) return true;
  //     for (let j = 0; j < this.props.layers.length; j++) {
  //       if (nextProps.layers[j].name !== this.props.layers[j].name ||
  //           nextProps.layers[j].service !== this.props.layers[j].service) {
  //         return true;
  //       }ReactWMJSMap
  //     }
  //   }

  //   /* BBReactWMJSMap/
  //   constReactWMJSMapis.props.bbox;
  //   constReactWMJSMaprops.bbox;
  //   /* CoReactWMJSMapin currentBbox with entries in nextBbox. Return true when at least one differs. */
  //   if (cReactWMJSMaprentBbox.reduce((acc, value, index) => {
  //     return acc || value !== nextBbox[index];
  //   }, false)) {
  //     this.adaguc.webMapJS.suspendEvent('onupdatebbox');
  //     this.adaguc.webMapJS.setBBOX(nextProps.bbox);
  //     console.log('setbbox', nextProps.bbox);
  //     this.drawDebounced(); // After 1000 ms also do a draw to load the data
  //     this.adaguc.webMapJS.resumeEvent('onupdatebbox');
  //   }

  //   console.log('no changes detected');

  //   return false;
  // }

  // componentDidUpdate (prevReactWMJSMapProps) {
  //   if (this.props.layers ReactWMJSMap&& this.props.layers.length) {
  //     this.adaguc.webMapJSReactWMJSMap.removeAllLayers();
  //     for (let j = 0; j < ReactWMJSMapthis.props.layers.length; j++) {
  //       this.adaguc.webMapReactWMJSMapJS.addLayer(this.props.layers[j]);
  //       if (this.props.layReactWMJSMaperReadyCallback) {
  //         this.props.layerReactWMJSMaps[j].parseLayer(
  //           (wmjsLayer) => {
  //             this.props.layerReadyCallback(wmjsLayer, this.adaguc.webMapJS);
  //           },
  //           undefined, 'ReactWebMapJS::componentDidUpdate');
  //       }
  //     }
  //   }
  // }

  getWMJSLayerFromReactLayer(wmjsLayers, reactWebMapJSLayer, index) {
    if (reactWebMapJSLayer.props.service && reactWebMapJSLayer.props.name) {
      console.log('getWMJSLayerFromReactLayer, checking index', index, wmjsLayers);
      if (index >=0 && index < wmjsLayers.length) {
        return wmjsLayers[index];
      }
    }
    console.log('Unable to find layer with index ', index, reactWebMapJSLayer)
    return null;
    // if (reactWebMapJSLayer.service && reactWebMapJSLayer.name) {
    //   for (let wmjsLayer in wmjsLayers) {
    //     if (wmjsLayer.reactWebMapJSLayer === reactWebMapJSLayer) {
    //       return wmjsLayers;
    //     }
    //   }
    // }
    // return null;
  }

  checkAdaguc () {
    
    if (this.adaguc.webMapJSCreated) {
      return;
    }
    this.adaguc.webMapJSCreated = true;
    // eslint-disable-next-line no-undef
    this.adaguc.webMapJS = new WMJSMap(this.refs.adagucwebmapjs);
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
    window.addEventListener('resize', this._handleWindowResize);

    // TODO: Now the map resizes when the right panel opens, (called via promise at EProfileTest.jsx) that is nice. But this reference is Ugly! How do we see a resize if no event is triggered?
    this.adaguc.webMapJS.handleWindowResize = this._handleWindowResize;

    if (this.props.webMapJSInitializedCallback && this.adaguc.webMapJS) {
      this.props.webMapJSInitializedCallback(this.adaguc.webMapJS, true);
    }
  }

  checkNewProps (props) {
    console.log('checkNewProps', props);

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
        React.Children.forEach(children, (child, i) => {
          if (child.type) {
            /* Check layers */
            if (typeof child.type === typeof ReactWMJSLayer) {
              
              if (child.props.baseLayer) {
                adagucWMJSBaseLayerIndex++;
                let wmjsLayer = this.getWMJSLayerFromReactLayer(wmjsBaseLayers, child, adagucWMJSBaseLayerIndex - 1);
                if (wmjsLayer === null) {
                  wmjsLayer = new WMJSLayer({...child.props});
                  this.adaguc.baseLayers.push(wmjsLayer);
                  wmjsLayer.reactWebMapJSLayer = child;
                  this.adaguc.webMapJS.setBaseLayers(this.adaguc.baseLayers);
                }       
              } else {
                adagucWMJSLayerIndex++;
                let wmjsLayer = this.getWMJSLayerFromReactLayer(wmjsLayers, child, adagucWMJSLayerIndex - 1);
                if (wmjsLayer === null) {                  
                  wmjsLayer = new WMJSLayer({...child.props});
                  wmjsLayer.parseLayer ((layer) => {
                    if (layer && layer.hasError === false) {
                      if (dispatch) {
                        let service = WMJSGetServiceFromStore(layer.service, xml2jsonrequestURL);
                        /* Update list of layers for service */
                        service.getLayerObjectsFlat((layers)=>{
                          dispatch(serviceSetLayers({service:layer.service, layers:layers}));
                        });
                        /* Update service information */
                        service.getCapabilities (()=>{
                          dispatch(setServiceInformation(service));
                        }, (e)=>{console.error(e);});
                        /* Update style information */
                        dispatch(setStylesInformation({service: layer.service, name:layer.name, styles:wmjsLayer.getStyles()}));
                      }
                    }
                  }, false, 'ReactWMJSMap.jsx',xml2jsonrequestURL);

                  wmjsLayer.reactWebMapJSLayer = child;
                  console.log('addLayer', wmjsLayer);
                  this.adaguc.webMapJS.addLayer(wmjsLayer);
                } else {
                  console.log('WMJSLayer found, updating props',child.props);
                  if (wmjsLayer.name !== child.props.name) {
                    wmjsLayer.setName(child.props.name);needsRedraw = true;
                    // Update style list info
                    console.log('styles:', wmjsLayer.getStyles());

                  }
                  if (wmjsLayer.opacity !== child.props.opacity) {wmjsLayer.setOpacity(child.props.opacity);needsRedraw = false;}
                  if (wmjsLayer.currentStyle !== child.props.style) {console.log('setting style');wmjsLayer.setStyle(child.props.style);needsRedraw = true;}
                }  
              }       
            }
          }
        });
        if (needsRedraw) {
          this.adaguc.webMapJS.draw();
        }
      }
    }

  }

  shouldComponentUpdate (nextProps) {
    console.log('shouldComponentUpdate', this.props);
    this.checkNewProps(nextProps);
    return false;
  }

  componentDidMount () {
    console.log('componentDidMount', this.props);
    this.checkAdaguc();
    this.checkNewProps(this.props);
    
  }

  componentWillUnmount () {
    console.log('componentWillUnmount');
    window.removeEventListener('resize', this._handleWindowResize);
    if (this.props.webMapJSInitializedCallback && this.props.layers && this.props.layers.length > 0) {
      this.props.webMapJSInitializedCallback(this.adaguc.webMapJS, false);
    }
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
    this.resize();
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
        <div style={{ overflow: 'visible', height:'inherit', padding:0, margin:0 }} >
          <div ref='adagucwebmapjs' />
        </div>
      </div>
    </div>);
  }
};
ReactWMJSMap.propTypes = {
  layers: PropTypes.array,
  dispatch: PropTypes.func,
  baselayers: PropTypes.array,
  listeners: PropTypes.array,
  bbox: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  webMapJSInitializedCallback: PropTypes.func,
  layerReadyCallback: PropTypes.func,
  srs: PropTypes.string
};
