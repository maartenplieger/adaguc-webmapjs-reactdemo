import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import produce from 'immer';
import { connect } from 'react-redux';

/* Constants */
const LAYERMANAGER_TOGGLE_DIMENSIONSELECTOR = 'LAYERMANAGER_TOGGLE_DIMENSIONSELECTOR';
const DIMENSIONSELECTOR_REDUCERNAME = 'layermanager.dimensionselector';

/* Action creators */
const layerManagerToggleDimensionSelectorAction = obj => ({ type: LAYERMANAGER_TOGGLE_DIMENSIONSELECTOR, payload: obj });

/* Reducer which adds its data into the store; the location inside the store is specified by the reducer name and the id from the action */
const layerManagerDimensionSelectorReducer = (state = { }, action = { type:null }) => {
  if (!action.id) { return state; }

  /* Standard reducer handling where the required id is abstracted away for convenience */
  const handleReducer = (state = { }, action = { type:null }) => {
    switch (action.type) {
      case LAYERMANAGER_TOGGLE_DIMENSIONSELECTOR:
        return produce(state, draft => { draft.isOpen = !draft.isOpen; });
      default:
        return state;
    }
  };

  /* Update the state at the correct location given by the id property from the action */
  return produce(state, draft => { draft[action.id] = handleReducer(state[action.id], action); });
};

/* Our custom mapStateToProps for this component */
const mapStateToProps = state => {
  return { dimensionSelector: state[DIMENSIONSELECTOR_REDUCERNAME] };
};

/* The initial state for this component */
const initialState = {
  isOpen:false
};

class DimensionSelector extends Component {
  constructor (props) {
    super(props);
    const { layer, dispatch } = this.props;

    /* Some checks */
    if (!layer || !layer.id) { console.warn('DimensionSelector misconfigured, layer missing'); return null; }

    /* Register this new dimensionSelector reducer with the reducerManager */
    window.reducerManager.add(DIMENSIONSELECTOR_REDUCERNAME, layerManagerDimensionSelectorReducer);

    /* Create our own convenience dispatch function which never forgets to add the requested id to the action */
    this.localDispatch = (action) => { dispatch(produce(action, draft => { draft.id = this.props.id; })); };
  }
  render () {
    const { layer, dimensionSelector } = this.props;
    const { localDispatch } = this;
    if (!layer || !layer.id || !layer.dimensions || !dimensionSelector) return null;
    if (!this.props.id) return null;
    const state = dimensionSelector[this.props.id] || initialState;
    const { dimensions } = layer;

    const selectedDims = [];
    for (let d = 0; d < dimensions.length; d++) {
      selectedDims.push(dimensions[d]);
    }
    const currentValue = '';

    return (
      <Dropdown isOpen={state.isOpen} toggle={() => { localDispatch(layerManagerToggleDimensionSelectorAction()); }}>
        <DropdownToggle caret>
          { currentValue }
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Select dimension</DropdownItem>
          {
            selectedDims.map((l, i) => {
              return (<DropdownItem active={l.name === currentValue} key={i} onClick={() => { console.log(l); }}>{l.name}</DropdownItem>);
            })
          }
        </DropdownMenu>
      </Dropdown>
    );
  }
}

DimensionSelector.propTypes = {
  layer: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  dimensionSelector: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(DimensionSelector);
