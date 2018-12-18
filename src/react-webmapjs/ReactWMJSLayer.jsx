import React, { Component } from 'react';
import PropTypes from 'prop-types';
export default class ReactWMJSLayer extends Component {
  render () {
    return (<div className='ReactWMJSLayer' >
      <div>{this.props.id}</div>
      <div dangerouslySetInnerHTML={{ __html:JSON.stringify(this.props, null, '--').replaceAll('\n', '<br/>') }} />
    </div>);
  }
};
ReactWMJSLayer.propTypes = {
  id: PropTypes.string.isRequired
};
