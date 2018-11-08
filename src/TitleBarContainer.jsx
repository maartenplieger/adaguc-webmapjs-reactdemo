import React, { Component } from 'react';
import { connect } from "react-redux";
import { Button } from "reactstrap";

class TitleBarContainer extends Component {
    constructor (props) {
      super(props);
    }

    render () {
        return (<div>TitleBarContainer</div>);
    }
};

const mapStateToProps = state => {
    return { };
};

export default connect(mapStateToProps)(TitleBarContainer);