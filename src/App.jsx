import React from "react";
import ReactDOM from "react-dom";
import WMJSMap from './react-webmapjs/ReactWMJSMap.jsx';
import WMJSLayer from './react-webmapjs/ReactWMJSLayer.jsx';
import WMJSTiledLayer from './react-webmapjs/ReactWMJSDimension.jsx';
import GeoJSONLayer from './react-webmapjs/ReactWMJSDimension.jsx';
import { WMJSDimension, WMJSGetServiceFromStore } from 'adaguc-webmapjs';

const config = {
  layers: [
    {
      service: "https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?",
      name: "RADNL_OPER_R___25PCPRR_L3_COLOR"
    }
  ]
};

const withDimensions = (config) => {
  return (IncomingComponent) => {
    return class ComposedComponent {
      componentDidMount() {
        let services = [];
        config.layers.map((layerConfig) =>
          services.push({name: layerConfig.name, service: WMJSGetServiceFromStore(layerConfig.service)})
        );
      }
      render() {
        const { caps } = capabilities;
        const { specialProp, ...otherProps } = this.props;
        const dimensions = [];
        const children = [];
        config.layers.map((layerConfig) => {
          children.push(<WMJSLayer {...layerConfig} />)
        });
        caps.map(cap => dimensions.push(cap.name, specialProp));
        <IncomingComponent dimensions={dimensions} {...otherProps} children={children} />
      }
    }
  }
}

const App = () => {
  let service = WMJSGetServiceFromStore("https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?");
  
  // let wmjsDimension = new WMUSDimension();
  // wmjsDimension.name = 'time';
  // wmjsDimension.currentValue = '2018-10-30T00:00:00Z';
  return (
    <div>
      <div style={{width:'100vw', height: '100vh', display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr'}}>
        {/* <span style={{zIndex: 20}} className='title'>ADAGUC WebMapJS Demo</span> */}
        <div style={{ gridColumn: 1, gridRow: 1, zIndex: 10}}>
          <WMJSMap bbox={[0,40,10,60]} srs={'EPSG:4326'} >
            <WMJSTiledLayer name="geowebblossom"/>
            <WMJSLayer service="https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?" name="nl_raster_latlon"/>
            <WMJSLayer service="https://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?" name="RADNL_OPER_R___25PCPRR_L3_COLOR" />
            <WMJSLayer service="https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?" name="world_line" format="image/png"/>
            <GeoJSONLayer json="http://bla"/>
          </WMJSMap>
        </div>
      </div>
    </div>
  );
};
// export default withDimensions(capabilities)(App);
export default App;

ReactDOM.render(<App />, document.getElementById("app"));

