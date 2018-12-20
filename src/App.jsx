import React from 'react';
import { connect } from 'react-redux';
import style from './styles/main.css'; // eslint-disable-line no-unused-vars
import 'bootstrap/dist/css/bootstrap.min.css';
import WMJSLayerManager from './ReduxWMJSLayerManager.jsx';
import TitleBarContainer from './TitleBarContainer';
import Content from './Content';
require('./img/adaguc-logo-favicon-16x16.png');
require('./img/adaguc-logo-favicon-32x32.png');

const App = () => {
  return (<div className='wrapper'>
    <div className='header'><TitleBarContainer /></div>
    <div className='sidebar'>Sidebar</div>
    <div className='content'><Content /></div>
    <div className='footer'><WMJSLayerManager /></div>
  </div>);
};
export default connect(null)(App);
