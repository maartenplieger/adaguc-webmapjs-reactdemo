import React, { Component } from 'react';
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { layerChangeName, layerChangeOpacity, layerChangeStyle } from '../js/actions/actions.js';

class ReactWMJSLayerManager extends Component {
    constructor (props) {
      super(props);
      this.add = this.add.bind(this);
      this.changeOpacity = this.changeOpacity.bind(this);
      this.changeStyle = this.changeStyle.bind(this);
    }
    add() {
        const { dispatch } = this.props;
        dispatch(layerChangeName({ mapPanelIndex:0, layerIndex: 0, name: 'RADNL_OPER_R___25PCPRR_L3_KNMI' }));
        
    }
    changeOpacity () {
        const { dispatch } = this.props;
        dispatch(layerChangeOpacity({ mapPanelIndex:0, layerIndex: 0, opacity: 1 }));
    }
    changeStyle () {
        const { dispatch } = this.props;
        dispatch(layerChangeStyle({ mapPanelIndex:0, layerIndex: 0, style: 'precip-blue/nearest' }));
    }
    render () {
        let array = [];
        for (let j=0;j<500;j++) {
            array.push(j);
        }
        return (<div>
            {/* <div>{array.map((el, i) => {return <div key={i} style={{display:'inline-block', width:'3px', height:'10px', backgroundColor:'grey', color:'black', border:'1px solid black'}}></div>;})}</div> */}
            ReactWMJSLayerManager {this.props.activeMapPanel.layers[0].props.name} 
            <Button onClick={this.add}>Layer</Button>
            <Button onClick={this.changeOpacity}>Opacity</Button>
            <Button onClick={this.changeStyle}>Style</Button>
        </div>);
    }
};

const mapStateToProps = state => {
    return { activeMapPanel: state.mapPanel[0] };
};

export default connect(mapStateToProps)(ReactWMJSLayerManager);