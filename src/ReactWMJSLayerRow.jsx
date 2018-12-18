import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { layerChangeName, layerChangeOpacity, layerChangeStyle, layerManagerToggleLayerSelector,
  layerManagerToggleStylesSelector, layerManagerToggleOpacitySelector } from './js/actions/actions.js';

class ReactWMJSLayerRow extends Component {
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
    if (!services || !services[layer.props.service] || !services[layer.props.service].layers) {
      return (<div><Button>Select service...</Button></div>);
    }
    const layers = services[layer.props.service].layers;
    let filteredLayers = layers.filter(l => l.name === layer.props.name);
    const currentValue = filteredLayers.length === 1 && filteredLayers[0].text ? filteredLayers[0].text : 'none';
    return (
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle caret>
          { currentValue }
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Select a layer</DropdownItem>
          {
            layers.map((l, i) => {
              return (<DropdownItem active={currentValue === l.text} key={i} onClick={() => { selectLayer(l.name); }}>{l.text}</DropdownItem>);
            })
          }
        </DropdownMenu>
      </Dropdown>
    );
  }

  renderStyles (services, layer, isOpen, toggle, selectStyle) {
    let currentStyle = { Name: { value:'none' }, Title:{ value: 'none' } };
    let styles = [];
    if (services && services[layer.props.service] && services[layer.props.service].layer) {
      const serviceLayer = services[layer.props.service].layer[layer.props.name];
      styles = serviceLayer && serviceLayer.styles && serviceLayer.styles.length > 0 ? serviceLayer.styles : [];
      currentStyle = styles.filter(l => l.name === layer.props.style)[0] || { Name: { value:'default' }, Title:{ value:'default' } };
    }
    const currentValue = currentStyle.Title.value;
    return (
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle caret>
          { currentValue }
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Select a style</DropdownItem>
          {
            styles.map((l, i) => {
              return (<DropdownItem active={l.Title.value === currentValue} key={i} onClick={() => { selectStyle(l.Name.value); }}>{l.Title.value}</DropdownItem>);
            })
          }
        </DropdownMenu>
      </Dropdown>
    );
  }

  renderOpacity (services, layer, isOpen, toggle, selectOpacity) {
    let currentOpacity = layer && layer.props && layer.props.opacity !== undefined ? layer.props.opacity : 1.0;
    let opacities = [
      { name:0.0, title: '0 %' },
      { name:0.1, title: '10 %' },
      { name:0.2, title: '20 %' },
      { name:0.3, title: '30 %' },
      { name:0.4, title: '40 %' },
      { name:0.5, title: '50 %' },
      { name:0.6, title: '60 %' },
      { name:0.7, title: '70 %' },
      { name:0.8, title: '80 %' },
      { name:0.8, title: '90 %' },
      { name:1.0, title: '100 %' }
    ];
    opacities.reverse();
    const currentValue = Math.round(currentOpacity * 100) + ' %';
    return (
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle caret>
          { currentValue }
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Select opacity</DropdownItem>
          {
            opacities.map((l, i) => {
              return (<DropdownItem active={l.title === currentValue} key={i} onClick={() => { selectOpacity(l.name); }}>{l.title}</DropdownItem>);
            })
          }
        </DropdownMenu>
      </Dropdown>
    );
  }

  render () {
    const { dispatch, layerIndex } = this.props;
    return (
      <Row>
        <Col xs='3'>
          {
            this.renderLayers(
              this.props.services,
              this.props.activeMapPanel.layers[layerIndex],
              this.props.layerManager.layers[layerIndex].layerSelectorOpen,
              () => { dispatch(layerManagerToggleLayerSelector({ layerIndex: layerIndex })); },
              (name) => { dispatch(layerChangeName({ mapPanelIndex:this.props.activeMapPanelId, layerIndex: layerIndex, name: name })); }
            )
          }
        </Col>
        <Col xs='3'>
          {
            this.renderStyles(
              this.props.services,
              this.props.activeMapPanel.layers[layerIndex],
              this.props.layerManager.layers[layerIndex].styleSelectorOpen,
              () => { dispatch(layerManagerToggleStylesSelector({ layerIndex: layerIndex })); },
              (style) => { dispatch(layerChangeStyle({ mapPanelIndex:this.props.activeMapPanelId, layerIndex: layerIndex, style: style })); }
            )
          }
        </Col>
        <Col xs='1'>
          {
            this.renderOpacity(
              this.props.services,
              this.props.activeMapPanel.layers[layerIndex],
              this.props.layerManager.layers[layerIndex].opacitySelectorOpen,
              () => { dispatch(layerManagerToggleOpacitySelector({ layerIndex: layerIndex })); },
              (opacity) => { dispatch(layerChangeOpacity({ mapPanelIndex:this.props.activeMapPanelId, layerIndex: layerIndex, opacity: opacity })); }
            )
          }
        </Col>
      </Row>);
  }
}

ReactWMJSLayerRow.propTypes = {
  dispatch: PropTypes.func,
  layerManager: PropTypes.object,
  services: PropTypes.object,
  activeMapPanel: PropTypes.object,
  activeMapPanelId: PropTypes.number,
  layerIndex: PropTypes.number
};

export default ReactWMJSLayerRow;
