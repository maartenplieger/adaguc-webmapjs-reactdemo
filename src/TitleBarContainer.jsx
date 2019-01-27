import React, { Component } from 'react';
import { connect } from 'react-redux';

class TitleBarContainer extends Component {
  render () {
    return (<div>React with Adaguc WebmapJS framework</div>);
  }
};

const mapStateToProps = state => {
  return { };
};

export default connect(mapStateToProps)(TitleBarContainer);
