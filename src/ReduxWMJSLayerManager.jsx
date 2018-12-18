import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { layerManagerSetNumberOfLayers, layerManagerMoveLayer } from './js/actions/actions.js';
import ReactWMJSLayerRow from './ReactWMJSLayerRow';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ dispatch, activeMapPanelId, activeMapPanel, layerManager, services, layerIndex }) => (
  <div style={{ backgroundColor:'black', padding: '2px 2px 2px 24px', margin: '2px' }}>
    <ReactWMJSLayerRow
      dispatch={dispatch}
      activeMapPanelId={activeMapPanelId}
      activeMapPanel={activeMapPanel}
      layerManager={layerManager}
      services={services}
      layerIndex={layerIndex}
    />
  </div>
));

const SortableList = SortableContainer(({ dispatch, activeMapPanelId, activeMapPanel, layerManager, services }) => {
  return (
    <div>
      {
        layerManager.layers.map((layer, layerIndex) => (<SortableItem
          key={layerIndex}
          dispatch={dispatch}
          activeMapPanelId={activeMapPanelId}
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
    const mapPanelIndex = this.props.activeMapPanelId;
    dispatch(layerManagerMoveLayer({ oldIndex, newIndex, mapPanelIndex }));
  }

  render () {
    const { activeMapPanelId, activeMapPanel, layerManager, services, dispatch } = this.props;
    return (<div>
      <SortableList onSortEnd={this.onSortEnd} dispatch={dispatch}
        activeMapPanelId={activeMapPanelId}
        activeMapPanel={activeMapPanel}
        layerManager={layerManager}
        services={services}
      />;
    </div>);
  }
};

const mapStateToProps = state => {
  const activeMapPanelId = state.activeMapPanelIndex;
  return {
    activeMapPanelId: activeMapPanelId,
    activeMapPanel: state.webmapjs.mapPanel[activeMapPanelId],
    layerManager: state.layerManager,
    services: state.webmapjs.services
  };
};

ReactWMJSLayerManager.propTypes = {
  dispatch: PropTypes.func,
  layerManager: PropTypes.object,
  services: PropTypes.object,
  activeMapPanel: PropTypes.object,
  activeMapPanelId: PropTypes.number
};

export default connect(mapStateToProps)(ReactWMJSLayerManager);
