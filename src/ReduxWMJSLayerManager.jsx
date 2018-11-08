import React, { Component } from 'react';
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { layerChangeName, layerChangeOpacity, layerChangeStyle, layerManagerToggleLayerSelector, layerManagerToggleStylesSelector } from './js/actions/actions.js';
import { WMJSLayer } from 'adaguc-webmapjs';
import WMJSGetServiceFromStore from 'adaguc-webmapjs';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

class ReactWMJSLayerManager extends Component {
    constructor (props) {
      super(props);
      this.changeOpacity = this.changeOpacity.bind(this);
      this.changeStyle = this.changeStyle.bind(this);
    }
   
    changeOpacity () {
        const { dispatch } = this.props;
        dispatch(layerChangeOpacity({ mapPanelIndex:0, layerIndex: 0, opacity: 1 }));
    }
    changeStyle () {
        const { dispatch } = this.props;
        dispatch(layerChangeStyle({ mapPanelIndex:0, layerIndex: 0, style: 'precip-blue/nearest' }));
    }
    renderLayers (services, layer, isOpen, toggle, selectLayer) {
      if (!services || !services[layer.props.service] || !services[layer.props.service].layers)return;
      const layers = services[layer.props.service].layers;
      return (
        <Dropdown isOpen={isOpen} toggle={toggle}>
          <DropdownToggle caret>
            { layers.filter(l => l.name === layer.props.name)[0].text }
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Select a layer</DropdownItem>
            { 
              layers.map((l,i) => {
                return (<DropdownItem key={i} onClick={()=>{selectLayer(l.name);}}>{l.text}</DropdownItem>);
              })
            }
          </DropdownMenu>
        </Dropdown>
      );
    }
    renderStyles (services, layer, isOpen, toggle, selectStyle) {
      if (!services || !services[layer.props.service] || !services[layer.props.service].layer)return;
      console.log('styles', services);
      console.log('styles', services[layer.props.service].layer);
      
      const serviceLayer = services[layer.props.service].layer[layer.props.name];
      console.log('styles', serviceLayer);
      if (!serviceLayer)return;
      const {styles} = serviceLayer;
      if (!styles) return;
      console.log('styles', styles);
      const currentStyle = styles.filter(l => l.name === layer.props.style)[0] || {Name:{value:'default'},Title:{value:'default'}};
      
      return (
        <Dropdown isOpen={isOpen} toggle={toggle}>
          <DropdownToggle caret>
            { currentStyle.Title.value }
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Select a layer</DropdownItem>
            { 
              styles.map((l,i) => {
                return (<DropdownItem key={i} onClick={()=>{selectStyle(l.Name.value);}}>{l.Title.value}</DropdownItem>);
              })
            }
          </DropdownMenu>
        </Dropdown>
      );
    }
    render () {
        let array = [];
        for (let j=0;j<500;j++) {
            array.push(j);
        }
        
        console.log(this.props.activeMapPanel.layers[0].layers);
        let selectLayer = (layer) => {
          console.log(layer);
        };
        const { dispatch } = this.props;
        return (<div>
            { 
              this.renderLayers(
                this.props.services,
                this.props.activeMapPanel.layers[0], 
                this.props.layerManager.layers[0].layerSelectorOpen,  
                ()=>{dispatch(layerManagerToggleLayerSelector({ layerIndex: 0}));},
                (name)=>{dispatch(layerChangeName({ mapPanelIndex:0, layerIndex: 0, name: name }));}
              )
            }
            { 
              this.renderStyles(
                this.props.services,
                this.props.activeMapPanel.layers[0], 
                this.props.layerManager.layers[0].styleSelectorOpen,  
                ()=>{dispatch(layerManagerToggleStylesSelector({ layerIndex: 0}));},
                (style)=>{dispatch(layerChangeStyle({ mapPanelIndex:0, layerIndex: 0, style: style }));}
              )
            }
            <Button onClick={this.changeOpacity}>Opacity</Button>
            <Button onClick={this.changeStyle}>Style</Button>
        </div>);
    }
};

const mapStateToProps = state => {
    return { 
      activeMapPanel: state.webmapjs.mapPanel[0],
      layerManager: state.layerManager,
      services: state.webmapjs.services
    };
};

export default connect(mapStateToProps)(ReactWMJSLayerManager);