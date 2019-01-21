import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getWMJSMapById, getWMJSLayerById } from '../react-webmapjs/ReactWMJSTools.jsx';
import { layerChangeDimension, layerManagerSetTimeResolution, layerManagerSetTimeValue } from '../js/actions/actions.js';
import produce from 'immer';
import { Icon } from 'react-fa';
import { Button } from 'reactstrap';
const moment = window.moment;

let timeResolutionSteps = [
  10,
  12,
  20,
  30,
  45,
  60,
  60 * 2.5,
  60 * 5,
  60 * 10,
  60 * 15,
  60 * 30,
  60 * 60,
  60 * 60 * 2,
  60 * 60 * 4,
  60 * 60 * 8,
  60 * 60 * 16,
  60 * 60 * 24,
  60 * 60 * 24 * 2,
  60 * 60 * 24 * 5,
  60 * 60 * 24 * 10,
  60 * 60 * 24 * 20,
  60 * 60 * 24 * 30,
  60 * 60 * 24 * 60,
  60 * 60 * 24 * 100,
  60 * 60 * 24 * 200,
  60 * 60 * 24 * 365
];

class ReactWMJSTimeSelector extends Component {
  constructor (props) {
    super(props);
    this.click = this.click.bind(this);
    this.resize = this.resize.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.timeBlockContainer = React.createRef();
    this.resizeCalled = false;
    this.getTimeDim = this.getTimeDim.bind(this);
  }

  onWheel (e) {
    e.preventDefault();
    const momentStart = moment(this.props.layerManager.timeStart, 'YYYY-MM-DDTHH:mm:SS');
    const momentEnd = moment(this.lastFoundTime, 'YYYY-MM-DDTHH:mm:SS');
    const currentTimeResolution = this.props.layerManager.timeResolution;
    let index = timeResolutionSteps.findIndex((a) => a === currentTimeResolution);
    const { dispatch } = this.props;
    if (e.deltaY > 1) index++;
    if (e.deltaY < -1) index--;
    if (index < 0) index = 0;
    if (index > timeResolutionSteps.length - 1) index = timeResolutionSteps.length - 1;
    const newTimeResolution = timeResolutionSteps[index];
    let currentValue = moment(this.props.layerManager.timeValue, 'YYYY-MM-DDTHH:mm:SS');
    let newStart = currentValue + (((momentStart - currentValue) * newTimeResolution) / currentTimeResolution);
    let newEnd = currentValue + (((momentEnd - currentValue) * newTimeResolution) / currentTimeResolution);
    const d = (newEnd - newStart) / 20;
    if (e.deltaX > 1) {
      newStart += d;
      newEnd += d;
      this.click(moment(currentValue + d).format('YYYY-MM-DDTHH:mm:SS'));
    }
    if (e.deltaX < -1) {
      newStart -= d;
      newEnd -= d;
      this.click(moment(currentValue - d).format('YYYY-MM-DDTHH:mm:SS'));
    }
    dispatch(layerManagerSetTimeResolution({
      timeResolution: newTimeResolution,
      timeStart: moment(newStart),
      timeEnd: moment(newEnd)
    }));
  }

  click (value) {
    const dimension = this.timeDimension;
    const { dispatch, activeMapPanel } = this.props;
    dispatch(layerManagerSetTimeValue({ timeValue:value }));
    const wmjsMap = getWMJSMapById(activeMapPanel.id);
    wmjsMap.setDimension(dimension.name, value, false);
    const wmjsLayers = wmjsMap.getLayers();
    for (let d = 0; d < wmjsLayers.length; d++) {
      const layer = wmjsLayers[d];
      if (layer.getDimension(dimension.name)) {
        dispatch(layerChangeDimension({
          mapPanelId:activeMapPanel.id,
          layerId: layer.ReactWMJSLayerId,
          dimension: produce(dimension, draft => { draft.currentValue = layer.getDimension(dimension.name).currentValue; })
        }));
      }
    }
    wmjsMap.draw('ReactWMJSLayerRow');
  }

  componentWillUpdate () {
    if (!this.resizeCalled) {
      this.resize();
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.resize);
  }

  componentDidUpdate () {
    const { dispatch } = this.props;

    if (!this.props.layerManager.timeStart) {
      const wmjsTimeDimension = this.getTimeDim();
      if (wmjsTimeDimension) {
        this.layerStartTime = moment(wmjsTimeDimension.getValueForIndex(0), 'YYYY-MM-DDTHH:mm:SS');
        this.layerDefaultTime = moment(wmjsTimeDimension.defaultValue, 'YYYY-MM-DDTHH:mm:SS');
        this.layerCurrentValue = moment(wmjsTimeDimension.currentValue, 'YYYY-MM-DDTHH:mm:SS');
        this.layerEndTime = moment(wmjsTimeDimension.getValueForIndex(wmjsTimeDimension.size() - 1), 'YYYY-MM-DDTHH:mm:SS');

        let layerManagerStartTime = moment(wmjsTimeDimension.getValueForIndex(wmjsTimeDimension.size() - 6), 'YYYY-MM-DDTHH:mm:SS');
        dispatch(layerManagerSetTimeResolution({
          timeResolution: 60,
          timeStart: moment(layerManagerStartTime),
          timeEnd: moment(this.layerEndTime),
          timeValue: moment(this.layerCurrentValue)
        
        }));
      }
    }

  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize);
  }

  resize () {
    if (this.timeBlockContainer && this.timeBlockContainer.current) {
      const element = this.timeBlockContainer.current;
      if (element) {
        const newWidth = element.clientWidth;
        const newHeight = element.clientHeight;
        if (this.currentWidth !== newWidth || this.currentHeight !== newHeight) {
          this.resizeCalled = true;
          this.currentWidth = newWidth;
          this.currentHeight = newHeight;
          this.forceUpdate();
        }
      }
    }    
  }

  getTimeDim () {
    const { layer } = this.props;
    if (!layer || !layer.dimensions) return null;
    const { dimensions } = layer;
    const timeDim = dimensions.filter(dimension => dimension.name === 'time')[0];
    if (!timeDim) return null;
    this.timeDimension = timeDim;
    let wmjsLayer = getWMJSLayerById(layer.id);
    const wmjsTimeDimension = wmjsLayer.getDimension(timeDim.name);
    if (!wmjsTimeDimension) return null;
    return wmjsTimeDimension;
  }

  render () {
    const wmjsTimeDimension = this.getTimeDim();
    if (!wmjsTimeDimension) {
      return (<div>No dims</div>);
    }
    const { layer } = this.props;
    const { dimensions } = layer;
    const timeDim = dimensions.filter(dimension => dimension.name === 'time')[0];
    if (!timeDim) return null;

    const currentIndex = wmjsTimeDimension.getIndexForValue(timeDim.currentValue);
    const momentStart = moment(this.props.layerManager.timeStart, 'YYYY-MM-DDTHH:mm:SS');
    this.lastFoundTime = moment(momentStart).add(this.props.layerManager.timeResolution, 'second');
    let time = moment(momentStart);
    let momentCalls = 0;
    let a = [];
    let b = [];
    let w = 0;
    let x = 0;
    const maxWidth = this.currentWidth ? (this.currentWidth - 50) : -1;
    let loopIndex = wmjsTimeDimension.getIndexForValue(momentStart.format('YYYY-MM-DDTHH:mm:SS'));
    let startX = 0;
    let lastBlockWidth = 0;
    let hasSelected = false;
    do {
      momentCalls++;
      this.lastFoundTime = time;
      time = time.add(this.props.layerManager.timeResolution, 'second');
      let timeString = time.format('YYYY-MM-DDTHH:mm:SS');
      const index = wmjsTimeDimension.getIndexForValue(timeString);
      if (index !== loopIndex) {
        let concat = false;
        if (index - loopIndex > 1) concat = true;
        const selected = loopIndex === currentIndex;
        if (selected) hasSelected = true;
        let b = loopIndex;
        if (b >= 0 && b < wmjsTimeDimension.size()) {
          let timeBlockWidth = (w - (concat ? 0 : 1));
          if (timeBlockWidth < 1) timeBlockWidth = 1;
          if (startX < 0) { timeBlockWidth += startX; startX = 0; }
          if (startX + timeBlockWidth > maxWidth) timeBlockWidth = maxWidth - startX;
          a.push(<button
            onMouseEnter={() => { this.click(wmjsTimeDimension.getValueForIndex(b)); }}
            className={'ReactWMJSLayerRowTimeBlock'}
            key={a.length}
            style={{
              border: 'none',
              borderLeft:selected && concat ? '1px solid white' : 'none',
              display:'inline-block',
              backgroundColor:selected && !concat ? 'white' : '#6C757D',
              left: startX + 'px',
              width: timeBlockWidth + 'px',
              height: '100%',
              top: '0px',
              padding:0,
              margin:0
            }}
          />);
        }
        lastBlockWidth = w;
        w = 0;
        startX = x;
        loopIndex = index;
      }      
      w += 8;
      x += 8;
    } while (momentCalls < 1000 && x < maxWidth + lastBlockWidth);

    this.layerStartTime = moment(wmjsTimeDimension.getValueForIndex(0), 'YYYY-MM-DDTHH:mm:SS');
    this.layerDefaultTime = moment(wmjsTimeDimension.defaultValue, 'YYYY-MM-DDTHH:mm:SS');
    this.layerCurrentValue = moment(wmjsTimeDimension.currentValue, 'YYYY-MM-DDTHH:mm:SS');
    this.layerEndTime = moment(wmjsTimeDimension.getValueForIndex(wmjsTimeDimension.size() - 1), 'YYYY-MM-DDTHH:mm:SS');

    if (maxWidth > 0) {
      /* Draw one block if no blocks were drawn in previous loop */
      if (a.length === 0) {
        if ((this.layerStartTime > momentStart) ||
          (this.layerEndTime > momentStart)) {
          let startX = parseInt(((this.layerStartTime - momentStart) / (this.lastFoundTime - momentStart)) * maxWidth);
          let width = parseInt(((this.layerEndTime - this.layerStartTime) / (this.lastFoundTime - momentStart)) * maxWidth);
          if (startX + width > 0 && startX < maxWidth) {
            if (startX < 0) { width += startX; startX = 0; }
            if (startX + width > maxWidth) width = maxWidth - startX;
            if (width < 1) width = 1;
            a.push(<div
              // onMouseEnter={() => { this.click(wmjsTimeDimension.getValueForIndex(b)); }}
              className={'ReactWMJSLayerRowTimeBlock'}
              key={a.length}
              style={{
                border: 'none',
                display:'inline-block',
                backgroundColor:'#6C757D',
                left: startX + 'px',
                width: width + 'px',
                height: '100%',
                top: '0px',
                padding:0,
                margin:0
              }}
            />);
          }
        }
      }

      /* Draw selected time if selected time was not drawn in previous loop */
      if (!hasSelected) {
        let startX = parseInt(((this.layerCurrentValue - momentStart) / (this.lastFoundTime - momentStart)) * maxWidth);
        if (startX > 0 && startX < maxWidth) {
          a.push(<div
            className={'ReactWMJSLayerRowTimeBlock'}
            key={a.length}
            style={{
              border:'none',
              display:'inline-block',
              backgroundColor:'white',
              left: startX + 'px',
              width: '1px',
              height: '100%',
              top: '0px',
              padding:0,
              margin:0
            }}
          />);
        }
      }

      /* Draw focus time button */
      a.push(<Button
        onClick={() => {
          // const timeResolution = 
          this.click(moment(this.layerDefaultTime).format('YYYY-MM-DDTHH:mm:SS'));
          this.props.dispatch(layerManagerSetTimeResolution({
            timeStart: moment(this.layerDefaultTime - (time - momentStart) * 0.5),
            timeEnd: moment(this.layerEndTime)
          }));
        }}
        className={'ReactWMJSLayerRowTimeBlock'}
        key={a.length}
        style={{
          // borderRadius:0,
          display:'inline-block',
          left: maxWidth + 'px',
          width: '32px',
          height: '100%',
          top: '0px',
          padding:0,
          margin:0
        }}
      >
        <Icon name='window-maximize' />
      </Button>);
    }
    return (
      <div>
        <div
          ref={this.timeBlockContainer}
          onWheel={this.onWheel}
          style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', overflow:'hidden' }}>
          <div style={{ width:(maxWidth + 5) + 'px', marginRight:'10px', height:'100%', backgroundColor: '#555', display:'inline-block' }} />
          {a}
        </div>
      </div>);
  };
};

ReactWMJSTimeSelector.propTypes = {
  layer: PropTypes.object,
  dispatch: PropTypes.func,
  layerManager: PropTypes.object,
  activeMapPanel: PropTypes.object
};

export default ReactWMJSTimeSelector;
