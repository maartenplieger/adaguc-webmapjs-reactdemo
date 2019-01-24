import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { layerManagerSetNumberOfLayers, layerManagerMoveLayer, layerManagerSetTimeResolution, serviceRefresh } from '../js/actions/actions.js';
import SortableWMJSReactLayerList from './SortableWMJSReactLayerList.jsx';
import { Button, Row, Col, Label } from 'reactstrap';
import { timeResolutionGetObject, timeResolutionGetIndexForValue, timeResolutionSteps } from './TimeResolutionSteps';
import { Icon } from 'react-fa';
import { parseWMJSLayerAndDispatchActions } from '../react-webmapjs/ReactWMJSParseLayer.jsx';
import { getWMJSMapById } from '../react-webmapjs/ReactWMJSTools.jsx';
const moment = window.moment;

class ReactWMJSLayerManager extends Component {
  constructor (props) {
    super(props);
    this.onSortEnd = this.onSortEnd.bind(this);
    this.refreshServices = this.refreshServices.bind(this);
  }

  componentWillUpdate (nextProps) {
    const { dispatch } = this.props;
    if (nextProps.layerManager.layers.length !== nextProps.activeMapPanel.layers.length) {
      dispatch(layerManagerSetNumberOfLayers(nextProps.activeMapPanel.layers.length));
    }
  }

  onSortEnd ({ oldIndex, newIndex }) {
    const { dispatch } = this.props;
    const mapPanelId = this.props.activeMapPanel.id;
    dispatch(layerManagerMoveLayer({ oldIndex, newIndex, mapPanelId }));
  }

  refreshServices () {
    const { activeMapPanel, dispatch } = this.props;
    const wmjsMap = getWMJSMapById(activeMapPanel.id);
    wmjsMap.clearImageStore();
    const wmjsLayers = wmjsMap.getLayers();
    for (let d = 0; d < wmjsLayers.length; d++) {
      parseWMJSLayerAndDispatchActions(wmjsLayers[d], dispatch, activeMapPanel.id, null, true).then(() => {wmjsMap.draw();});
    }
  }

  render () {
    const { activeMapPanel, layerManager, services, dispatch } = this.props;

    let timeValue = '-';
    let localTime = '-';
    if (layerManager && layerManager.timeValue) {
      let timeValueAsMoment = moment.utc(layerManager.timeValue);
      if (timeValueAsMoment.isValid()) {
        timeValue = timeValueAsMoment.format('YYYY-MM-DDTHH:mm:SS');
        localTime = timeValueAsMoment.local().format('YYYY-MM-DDTHH:mm:SS');
      }
    }
    const currentTimeResolutionIndex = timeResolutionGetIndexForValue(layerManager.timeResolution);
    return (<div className={'ReduxWMJSLayerManagerWrapper'}>
      <div className={'ReduxWMJSLayerManagerContent'}>
        <SortableWMJSReactLayerList
          useDragHandle
          onSortEnd={this.onSortEnd} dispatch={dispatch}
          activeMapPanel={activeMapPanel}
          layerManager={layerManager}
          services={services}
        />
      </div>
      <div className={'ReduxWMJSLayerManagerFooter'} >
        <Row>
          <Col xs='8' style={{ paddingTop:'6px' }}>{ timeValue + ' UTC / ' + localTime + ' Local time'}</Col>
          <Col xs='2'>
            <div>
              <Button disabled={currentTimeResolutionIndex >= timeResolutionSteps.length - 1} onClick={() => {
                const index = currentTimeResolutionIndex + 1;
                if (index < timeResolutionSteps.length) { dispatch(layerManagerSetTimeResolution({ timeResolution: timeResolutionSteps[index].value })); }
              }}><Icon name='minus' />
              </Button>
              <Label style={{width:'7rem', textAlign:'center'}}>{ timeResolutionGetObject(layerManager.timeResolution).title }</Label>
              <Button disabled={currentTimeResolutionIndex === 0} onClick={() => {
                const index = currentTimeResolutionIndex - 1; 
                if (index >= 0) { dispatch(layerManagerSetTimeResolution({ timeResolution: timeResolutionSteps[index].value })); }
              }}><Icon name='plus' />
              </Button>
            </div>
          </Col>
          <Col xs='1'><Button onClick={this.refreshServices}>Refresh</Button></Col>
          <Col xs='1'><Button onClick={() => { alert('tbd'); }}>Add</Button></Col>
        </Row>
      </div>
    </div>);
  }
};

const mapStateToProps = state => {
  const activeMapPanelIndex = state.activeMapPanelIndex;
  return {
    activeMapPanel: state.webmapjs.mapPanel[activeMapPanelIndex],
    layerManager: state.layerManager,
    services: state.webmapjs.services
  };
};

ReactWMJSLayerManager.propTypes = {
  dispatch: PropTypes.func,
  layerManager: PropTypes.object,
  services: PropTypes.object,
  activeMapPanel: PropTypes.object
};

export default connect(mapStateToProps)(ReactWMJSLayerManager);
