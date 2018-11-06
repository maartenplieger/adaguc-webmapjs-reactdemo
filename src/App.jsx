import React from "react";
import { connect } from "react-redux";
import style from "./styles/main.css";
import WMJSLayerManager from './react-webmapjs/ReactWMJSLayerManager.jsx';
import TitleBarContainer from './TitleBarContainer';
import Content from './Content'

const App = () => {
  return (<div className="wrapper">
      <div className="header"><TitleBarContainer/></div>
      <div className="sidebar">Sidebar</div>
      <div className="content"><Content/></div>     
      <div className="footer"><WMJSLayerManager/></div>
    </div>);
};
export default connect(null)(App);


