import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { layerChangeName, layerChangeEnabled, layerChangeOpacity, layerChangeStyle, layerManagerToggleLayerSelector,
  layerManagerToggleStylesSelector, layerManagerToggleOpacitySelector, layerChangeDimension } from './js/actions/actions.js';
import { Icon } from 'react-fa';
import { getWMJSLayerById, getWMJSMapById } from './react-webmapjs/ReactWMJSTools.jsx';
import produce from 'immer';
const moment = window.moment;

class ReactWMJSLayerRow extends Component {
  constructor (props) {
    super(props);
    this.click = this.click.bind(this);
  }
  renderEnabled (layer, enableLayer) {
    if (!layer) {
      return (<div>-</div>);
    }
    let enabled = (layer.enabled !== false);
    return (<div><Button
      onClick={() => enableLayer(!enabled)}><Icon name={enabled ? 'eye' : 'eye-slash'} /></Button></div>);
  }
  renderLayers (services, layer, isOpen, toggle, selectLayer) {
    if (!services || !services[layer.service] || !services[layer.service].layers) {
      return (<div><Button>Select service...</Button></div>);
    }
    const layers = services[layer.service].layers;
    let filteredLayers = layers.filter(l => l.name === layer.name);
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
    if (services && services[layer.service] && services[layer.service].layer) {
      const serviceLayer = services[layer.service].layer[layer.name];
      styles = serviceLayer && serviceLayer.styles && serviceLayer.styles.length > 0 ? serviceLayer.styles : [];
      currentStyle = styles.filter(l => l.name === layer.style)[0] || { Name: { value:'default' }, Title:{ value:'default' } };
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
    let currentOpacity = layer && layer.opacity !== undefined ? layer.opacity : 1.0;
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
  };

  click (layerId, value, dimension) {
    // console.log('layerChangeDimension', dimension.name, value);
    const { dispatch, activeMapPanel } = this.props;
    const wmjsMap = getWMJSMapById(activeMapPanel.id);
    wmjsMap.setDimension(dimension.name, value, false);
    const wmjsLayers = wmjsMap.getLayers();
    for (let d = 0; d < wmjsLayers.length; d++) {
      const layer = wmjsLayers[d];
      // console.log('setting ' + layer.name + '/' + layer.getDimension(dimension.name).currentValue);
      dispatch(layerChangeDimension({
        mapPanelId:activeMapPanel.id,
        layerId: layer.ReactWMJSLayerId,
        dimension: produce(dimension, draft => { draft.currentValue = layer.getDimension(dimension.name).currentValue; })
      }));
    }
    wmjsMap.draw('ReactWMJSLayerRow');
    // dispatch(layerChangeDimension({
    //   mapPanelId:activeMapPanel.id,
    //   layerId: layerId,
    //   dimension: produce(dimension, draft => { draft.currentValue = value; })
    // }));
  }

  renderTime (layer) {
    // console.log('renderTime', layer);
    if (!layer || !layer.dimensions) return (<div>No dims</div>);
    const { dimensions } = layer;
    const timeDim = dimensions.filter(dimension => dimension.name === 'time')[0];
    if (!timeDim) {
      return (<div>No dims</div>);
    }
    let wmjsLayer = getWMJSLayerById(layer.id);
    const startTime = '2018-12-20T08:00:00Z';
    const stopTime = '2018-12-20T15:00:00Z';
    const wmjsTimeDimension = wmjsLayer.getDimension(timeDim.name);
    // const startIndex = wmjsTimeDimension.getIndexForValue(startTime);
    // const stopIndex = wmjsTimeDimension.getIndexForValue(stopTime);
    const currentIndex = wmjsTimeDimension.getIndexForValue(timeDim.currentValue);
    const momentStart = moment(startTime, 'YYYY-MM-DDTHH:mm:SS');
    const momentEnd = moment(stopTime, 'YYYY-MM-DDTHH:mm:SS');
    let time = momentStart;
    let momentCalls = 0;
    let a = [];
    let w = 0;
    let x = 0;
    const width = 400;
    const height = 40;
    let loopIndex = wmjsTimeDimension.getIndexForValue(momentStart.format('YYYY-MM-DDTHH:mm:SS'));
    let startX = 0;

    do {
      momentCalls++;
      time = time.add('1', 'minute');
      let timeString = time.format('YYYY-MM-DDTHH:mm:SS');
      const index = wmjsTimeDimension.getIndexForValue(timeString);
      if (index !== loopIndex) {
        const selected = loopIndex === currentIndex;
        let b = loopIndex;
        if (b >= 0 && b < wmjsTimeDimension.size()) {
          a.push(<button
            onMouseEnter={() => { this.click(layer.id, wmjsTimeDimension.getValueForIndex(b), timeDim); }}
            className={'ReactWMJSLayerRowTimeBlock'}
            key={momentCalls}
            style={{
              border:selected ? '1px solid yellow' : '1px solid #555',
              backgroundColor:selected ? 'yellow' : '#6C757D',
              left: startX + 'px',
              width: w + 'px',
              height:'40px'
            }}
          />);
        }
        w = 0;
        startX = x;
        loopIndex = index;
      }
      w++;
      x++;
    } while (time < momentEnd);
    return (<div style={{ width: width + 'px', height: height + 'px', backgroundColor: '#555', display: 'block', position: 'absolute', overflow:'hidden' }}>{a}</div>);
  };

  render () {
    const { dispatch, layerIndex } = this.props;
    return (
      <Row>
        <Col xs='0'>
          {
            this.renderEnabled(
              this.props.activeMapPanel.layers[layerIndex],
              (enabled) => { dispatch(layerChangeEnabled({ mapPanelId:this.props.activeMapPanel.id, layerIndex: layerIndex, enabled: enabled })); }
            )
          }
        </Col>
        <Col xs='4'>
          {
            this.renderLayers(
              this.props.services,
              this.props.activeMapPanel.layers[layerIndex],
              this.props.layerManager.layers[layerIndex].layerSelectorOpen,
              () => { dispatch(layerManagerToggleLayerSelector({ layerIndex: layerIndex })); },
              (name) => { dispatch(layerChangeName({ mapPanelId:this.props.activeMapPanel.id, layerIndex: layerIndex, name: name })); }
            )
          }
        </Col>
        <Col xs='2'>
          {
            this.renderStyles(
              this.props.services,
              this.props.activeMapPanel.layers[layerIndex],
              this.props.layerManager.layers[layerIndex].styleSelectorOpen,
              () => { dispatch(layerManagerToggleStylesSelector({ layerIndex: layerIndex })); },
              (style) => { dispatch(layerChangeStyle({ mapPanelId:this.props.activeMapPanel.id, layerId: this.props.activeMapPanel.layers[layerIndex].id, style: style })); }
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
              (opacity) => { dispatch(layerChangeOpacity({ mapPanelId:this.props.activeMapPanel.id, layerIndex: layerIndex, opacity: opacity })); }
            )
          }
        </Col>
        <Col xs='4'>{ this.renderTime(this.props.activeMapPanel.layers[layerIndex]) }</Col>
      </Row>);
  }
}

ReactWMJSLayerRow.propTypes = {
  dispatch: PropTypes.func,
  layerManager: PropTypes.object,
  services: PropTypes.object,
  activeMapPanel: PropTypes.object,
  layerIndex: PropTypes.number
};

export default ReactWMJSLayerRow;
