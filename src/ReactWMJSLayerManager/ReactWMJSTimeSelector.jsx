import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getWMJSMapById, getWMJSLayerById } from '../react-webmapjs/ReactWMJSTools.jsx';
import { layerChangeDimension, layerManagerSetTimeResolution, layerManagerSetTimeValue } from '../js/actions/actions.js';
import produce from 'immer';
import { Icon } from 'react-fa';
import { Button } from 'reactstrap';
import { timeResolutionSteps, timeResolutionGetIndexForValue } from './TimeResolutionSteps';
const moment = window.moment;

class ReactWMJSTimeSelector extends Component {
  constructor (props) {
    super(props);
    this.click = this.click.bind(this);
    this.resize = this.resize.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.timeBlockContainer = React.createRef();
    this.resizeCalled = false;
    this.getTimeDim = this.getTimeDim.bind(this);
    this.getFocusTimeButton = this.getFocusTimeButton.bind(this);
    this.getLayerManagerStartTime = this.getLayerManagerStartTime.bind(this);
    this.getDecreaseTimeButton = this.getDecreaseTimeButton.bind(this);
    this.getIncreaseTimeButton = this.getIncreaseTimeButton.bind(this);
    this.focusTimeInTimeSelector = this.focusTimeInTimeSelector.bind(this);
    this.decreaseTime = this.decreaseTime.bind(this);
    this.increaseTime = this.increaseTime.bind(this);
    this.timeBlockSize = 8;
  }

  getLayerManagerStartTime (startTime) {
    const width = this.maxWidth !== -1 ? this.maxWidth : 200;
    const currentTimeResolution = this.props.layerManager.timeResolution;
    let secondsTimeStart = parseInt(((width) / this.timeBlockSize) - (2 * this.timeBlockSize));
    return moment.utc(moment.utc(startTime).add(currentTimeResolution * (-secondsTimeStart), 'second'), 'YYYY-MM-DDTHH:mm:SS');
  }

  focusTimeInTimeSelector () {
    const timeDim = this.getTimeDim(); if (!timeDim) { console.warn('No time dimension found'); return; }
    const currentValue = timeDim.currentValue;
    if (moment.utc(currentValue) <= moment.utc(this.props.layerManager.timeStart) ||
      moment.utc(currentValue) >= moment.utc(this.previousLastFoundTime)) {
      this.props.dispatch(layerManagerSetTimeResolution({
        timeStart: this.getLayerManagerStartTime(currentValue),
        timeEnd: this.getLayerManagerStartTime(this.previousLastFoundTime)
      }));
    }
  }

  decreaseTime () {
    const timeDim = this.getTimeDim(); if (!timeDim) { console.warn('No time dimension found'); return; }
    let newIndex = timeDim.getIndexForValue(timeDim.currentValue, true) - 1;
    if (newIndex < 0) { console.log('Already at earliest date'); return; }
    if (newIndex >= timeDim.size()) { console.log('Already at latest date'); return; }
    const newValue = timeDim.getValueForIndex(newIndex);
    this.click(newValue);
    this.focusTimeInTimeSelector();
  }

  increaseTime () {
    const timeDim = this.getTimeDim(); if (!timeDim) { console.warn('No time dimension found'); return; }
    let newIndex = timeDim.getIndexForValue(timeDim.currentValue, true) + 1;
    if (newIndex < 0) { console.log('Already at earliest date'); return; }
    if (newIndex >= timeDim.size()) { console.log('Already at latest date'); return; }
    this.click(timeDim.getValueForIndex(newIndex));
    this.focusTimeInTimeSelector();
  }

  getDecreaseTimeButton (key, leftPosition) {
    return (<Button
      onClick={this.decreaseTime}
      className={'ReactWMJSLayerTimeFocusButton'}
      key={key}
      style={{ left: leftPosition + 'px', padding: 0 }}
    >
      <Icon name='minus' />
    </Button>);
  }

  getIncreaseTimeButton (key, leftPosition) {
    return (<Button
      onClick={this.increaseTime}
      className={'ReactWMJSLayerTimeFocusButton'}
      key={key}
      style={{ left: leftPosition + 'px', padding: 0 }}
    >
      <Icon name='plus' />
    </Button>);
  }

  getFocusTimeButton (key, leftPosition) {
    return (<Button
      onClick={() => {
        this.click(moment.utc(this.layerDefaultTime).format('YYYY-MM-DDTHH:mm:SS'));
        this.props.dispatch(layerManagerSetTimeResolution({
          timeStart: moment.utc(this.getLayerManagerStartTime(this.layerEndTime)),
          timeEnd: moment.utc(this.layerEndTime)
        }));
      }}
      className={'ReactWMJSLayerTimeFocusButton'}
      key={key}
      style={{ left: leftPosition + 'px', padding: 0 }}
    >
      <Icon name='window-maximize' />
    </Button>);
  }
  onWheel (e) {
    e.preventDefault();
    const momentStart = moment.utc(this.props.layerManager.timeStart, 'YYYY-MM-DDTHH:mm:SS');
    const momentEnd = moment.utc(this.lastFoundTime, 'YYYY-MM-DDTHH:mm:SS');
    const currentTimeResolution = this.props.layerManager.timeResolution;
    let index = timeResolutionGetIndexForValue(currentTimeResolution);
    const { dispatch } = this.props;
    if (e.deltaY > 1) index++;
    if (e.deltaY < -1) index--;
    if (index < 0) index = 0;
    if (index > timeResolutionSteps.length - 1) index = timeResolutionSteps.length - 1;
    const newTimeResolution = timeResolutionSteps[index].value;
    let currentValue = moment.utc(this.props.layerManager.timeValue, 'YYYY-MM-DDTHH:mm:SS');
    let newStart = currentValue + (((momentStart - currentValue) * newTimeResolution) / currentTimeResolution);
    let newEnd = currentValue + (((momentEnd - currentValue) * newTimeResolution) / currentTimeResolution);
    const d = (newEnd - newStart) / 20;
    if (e.deltaX > 1) {
      newStart += d;
      newEnd += d;
      this.click(moment.utc(currentValue + d).format('YYYY-MM-DDTHH:mm:SS'));
    }
    if (e.deltaX < -1) {
      newStart -= d;
      newEnd -= d;
      this.click(moment.utc(currentValue - d).format('YYYY-MM-DDTHH:mm:SS'));
    }
    dispatch(layerManagerSetTimeResolution({
      timeResolution: newTimeResolution,
      timeStart: moment.utc(newStart),
      timeEnd: moment.utc(newEnd)
    }));
  }

  click (value) {
    const dimension = this.timeDimension;
    const { dispatch, activeMapPanel } = this.props;
    dispatch(layerManagerSetTimeValue({ timeValue: value }));
    const wmjsMap = getWMJSMapById(activeMapPanel.id);
    wmjsMap.setDimension(dimension.name, value, false);
    const wmjsLayers = wmjsMap.getLayers();
    for (let d = 0; d < wmjsLayers.length; d++) {
      const layer = wmjsLayers[d];
      if (layer.getDimension(dimension.name)) {
        dispatch(layerChangeDimension({
          mapPanelId: activeMapPanel.id,
          layerId: layer.ReactWMJSLayerId,
          dimension: produce(dimension, draft => { draft.currentValue = layer.getDimension(dimension.name).currentValue; })
        }));
      }
    }
    wmjsMap.draw('ReactWMJSLayerRow');
  }

  componentDidMount () {
    window.addEventListener('resize', this.resize);
  }

  componentDidUpdate () {
    const { dispatch } = this.props;
    if (!this.resizeCalled) {
      this.resize();
    }
    if (!this.props.layerManager.timeStart && this.maxWidth !== -1) {
      const wmjsTimeDimension = this.getTimeDim();
      if (wmjsTimeDimension) {
        this.layerStartTime = moment.utc(wmjsTimeDimension.getValueForIndex(0), 'YYYY-MM-DDTHH:mm:SS');
        this.layerDefaultTime = moment.utc(wmjsTimeDimension.defaultValue, 'YYYY-MM-DDTHH:mm:SS');
        this.layerCurrentValue = moment.utc(wmjsTimeDimension.currentValue, 'YYYY-MM-DDTHH:mm:SS');
        this.layerEndTime = moment.utc(wmjsTimeDimension.getValueForIndex(wmjsTimeDimension.size() - 1), 'YYYY-MM-DDTHH:mm:SS');
        dispatch(layerManagerSetTimeResolution({
          timeResolution: 60,
          timeStart: moment.utc(this.getLayerManagerStartTime(this.layerEndTime)),
          timeEnd: moment.utc(this.layerEndTime),
          timeValue: moment.utc(this.layerCurrentValue)
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
    const momentStart = moment.utc(this.props.layerManager.timeStart, 'YYYY-MM-DDTHH:mm:SS');
    this.lastFoundTime = moment.utc(momentStart).add(this.props.layerManager.timeResolution, 'second');
    let time = moment.utc(momentStart);
    let momentCalls = 0;
    let timeBlockArray = [];
    let w = 0;
    let x = 0;
    this.maxWidth = this.currentWidth ? (this.currentWidth - (32 * 3)) : -1; // 32 * 3 is for the three time buttons
    let loopIndex = wmjsTimeDimension.getIndexForValue(momentStart.format('YYYY-MM-DDTHH:mm:SS'));
    let startX = 0;
    let lastBlockWidth = 0;
    let hasSelected = false;
    let previousTime = this.lastFoundTime;
    this.previousLastFoundTime = this.lastFoundTime;
    do {
      momentCalls++;
      previousTime = time;
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
          if (startX + timeBlockWidth > this.maxWidth) timeBlockWidth = this.maxWidth - startX;
          this.previousLastFoundTime = (wmjsTimeDimension.getValueForIndex(b));
          timeBlockArray.push(<button
            onMouseEnter={() => { this.click(wmjsTimeDimension.getValueForIndex(b)); }}
            className={'ReactWMJSLayerRowTimeBlock'}
            key={timeBlockArray.length}
            style={{
              border: 'none',
              borderLeft: selected && concat ? '1px solid white' : 'none',
              display: 'inline-block',
              backgroundColor: selected && !concat ? 'white' : '#6C757D',
              left: startX + 'px',
              width: timeBlockWidth + 'px',
              height: '100%',
              top: '0px',
              padding: 0,
              margin: 0
            }}
          />);
        }
        this.lastFoundTime = previousTime;
        lastBlockWidth = w;
        w = 0;
        startX = x;
        loopIndex = index;
      }
      w += this.timeBlockSize;
      x += this.timeBlockSize;
    } while (momentCalls < 1000 && x < this.maxWidth + lastBlockWidth);

    this.layerStartTime = moment.utc(wmjsTimeDimension.getValueForIndex(0), 'YYYY-MM-DDTHH:mm:SS');
    this.layerDefaultTime = moment.utc(wmjsTimeDimension.defaultValue, 'YYYY-MM-DDTHH:mm:SS');
    this.layerCurrentValue = moment.utc(wmjsTimeDimension.currentValue, 'YYYY-MM-DDTHH:mm:SS');
    this.layerEndTime = moment.utc(wmjsTimeDimension.getValueForIndex(wmjsTimeDimension.size() - 1), 'YYYY-MM-DDTHH:mm:SS');

    if (this.maxWidth > 0) {
      /* Draw one block if no blocks were drawn in previous loop */
      if (timeBlockArray.length === 0) {
        if ((this.layerStartTime > momentStart) ||
          (this.layerEndTime > momentStart)) {
          let startX = parseInt(((this.layerStartTime - momentStart) / (this.lastFoundTime - momentStart)) * this.maxWidth);
          let width = parseInt(((this.layerEndTime - this.layerStartTime) / (this.lastFoundTime - momentStart)) * this.maxWidth);
          if (startX + width > 0 && startX < this.maxWidth) {
            if (startX < 0) { width += startX; startX = 0; }
            if (startX + width > this.maxWidth) width = this.maxWidth - startX;
            if (width < 1) width = 1;
            timeBlockArray.push(<div
              // onMouseEnter={() => { this.click(wmjsTimeDimension.getValueForIndex(b)); }}
              className={'ReactWMJSLayerRowTimeBlock'}
              key={timeBlockArray.length}
              style={{
                border: 'none',
                display: 'inline-block',
                backgroundColor: '#6C757D',
                left: startX + 'px',
                width: width + 'px',
                height: '100%',
                top: '0px',
                padding: 0,
                margin: 0
              }}
            />);
          }
        }
      }

      /* Draw selected time if selected time was not drawn in previous loop */
      if (!hasSelected) {
        let startX = parseInt(((this.layerCurrentValue - momentStart) / (this.lastFoundTime - momentStart)) * this.maxWidth);
        if (startX > 0 && startX < this.maxWidth) {
          timeBlockArray.push(<div
            className={'ReactWMJSLayerRowTimeBlock'}
            key={timeBlockArray.length}
            style={{
              border: 'none',
              display: 'inline-block',
              backgroundColor: 'white',
              left: startX + 'px',
              width: '1px',
              height: '100%',
              top: '0px',
              padding: 0,
              margin: 0
            }}
          />);
        }
      }
    }
    return (
      <div>
        <div
          ref={this.timeBlockContainer}
          onWheel={this.onWheel}
          style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', overflow: 'hidden' }}>
          <div style={{ width: (this.maxWidth) + 'px', marginRight: '0px', height: '100%', backgroundColor: '#555', display: 'inline-block' }} />
          {timeBlockArray}
        </div>
        <div>{this.getDecreaseTimeButton(0, this.currentWidth - 96)}</div>
        <div>{this.getIncreaseTimeButton(1, this.currentWidth - 64)}</div>
        <div>{this.getFocusTimeButton(2, this.currentWidth - 32)}</div>
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
