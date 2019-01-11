import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { layerManagerSetNumberOfLayers, layerManagerMoveLayer } from '../js/actions/actions.js';
import ReactWMJSLayerRow from './ReactWMJSLayerRow';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableReactWMJSLayerRow = SortableElement(({ dispatch, activeMapPanel, layerManager, services, layerIndex }) => (
  <div className={'noselect'} style={{ backgroundColor:'black', padding: '2px 2px 2px 24px', margin: '2px' }}>
    <ReactWMJSLayerRow
      dispatch={dispatch}
      activeMapPanel={activeMapPanel}
      layerManager={layerManager}
      services={services}
      layerIndex={layerIndex}
    />
  </div>
));

const SortableReactWMJSLayerList = SortableContainer(({ dispatch, activeMapPanelId, activeMapPanel, layerManager, services }) => {
  return (
    <div>
      {
        layerManager.layers.map((layer, layerIndex) => (<SortableReactWMJSLayerRow
          key={layerIndex}
          dispatch={dispatch}
          activeMapPanel={activeMapPanel}
          layerManager={layerManager}
          services={services}
          layerIndex={layerIndex}
          index={layerIndex}
        />)
        )
      }
    </div>
  );
});

class ReactWMJSLayerManager extends Component {
  constructor (props) {
    super(props);
    this.onSortEnd = this.onSortEnd.bind(this);
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

  render () {
    const { activeMapPanel, layerManager, services, dispatch } = this.props;
    return (<div>
      <SortableReactWMJSLayerList onSortEnd={this.onSortEnd} dispatch={dispatch}
        activeMapPanel={activeMapPanel}
        layerManager={layerManager}
        services={services}
      />
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
