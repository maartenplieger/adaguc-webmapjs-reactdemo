import WMJSGetServiceFromStore from 'adaguc-webmapjs/src/WMJSGetServiceFromStore';
import { serviceSetLayers, layerSetStyles, layerSetDimensions, layerChangeStyle, layerChangeDimension } from './ReactWMJSActions';

export const parseWMJSLayerAndDispatchActions = (wmjsLayer, dispatch, mapPanelId, xml2jsonrequestURL, forceRefresh = false) => {
  return new Promise((resolve, reject) => {
    wmjsLayer.parseLayer((_layer) => {
      let wmjsLayer = _layer;
      if (wmjsLayer && wmjsLayer.hasError === false) {
        if (dispatch) {
          let service = WMJSGetServiceFromStore(wmjsLayer.service, xml2jsonrequestURL);
          /* Update list of layers for service */
          let done = (layers) => {
            dispatch(serviceSetLayers({ service:wmjsLayer.service, layers:layers }));
            // /* Update service information in services */
            // dispatch(setServiceInformation(service));
            /* Update style information in services for a layer */
            dispatch(layerSetStyles({ service: wmjsLayer.service, name:wmjsLayer.name, styles:wmjsLayer.getStyles() }));
            /* Select first style in service for a layer */
            dispatch(layerChangeStyle({
              service: wmjsLayer.service,
              mapPanelId: mapPanelId,
              layerId:wmjsLayer.ReactWMJSLayerId,
              style: wmjsLayer.currentStyle// || wmjsLayer.getStyles().length > 0 ? wmjsLayer.getStyles()[0].Name.value : 'default'
            }));
            /* Update dimensions information in services for a layer */
            dispatch(layerSetDimensions({ service: wmjsLayer.service, name:wmjsLayer.name, dimensions:wmjsLayer.dimensions }));
            for (let d = 0; d < wmjsLayer.dimensions.length; d++) {
              let dimension = {
                name: wmjsLayer.dimensions[d].name,
                units: wmjsLayer.dimensions[d].units,
                currentValue: wmjsLayer.dimensions[d].currentValue
              };
              dispatch(layerChangeDimension({
                service: wmjsLayer.service,
                mapPanelId: mapPanelId,
                layerId:wmjsLayer.ReactWMJSLayerId,
                dimension:dimension
              }));
            }
            resolve();
          };
          service.getLayerObjectsFlat(done);
        }
      }
    }, forceRefresh, 'ReactWMJSParseLayer.jsx', xml2jsonrequestURL);
  });
}