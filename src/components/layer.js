import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import layersConfig from '../api/layers.json';
import BuildingsAPI from '../api/building';
import {
  update,
} from '../store/actions';

class Layer extends Component {
  constructor(props) {
    super(props);
    this.getColor = this.getColor.bind(this);
    this.layerExists = this.layerExists.bind(this);

    this.message = this.message.bind(this);
    this.addLayer = this.addLayer.bind(this);
    this.removeLayer = this.removeLayer.bind(this);
    this.addCircles = this.addCircles.bind(this);
    this.addDots = this.addDots.bind(this);
    this.addExtrudedDots = this.addExtrudedDots.bind(this);
    this.addHeatMap = this.addHeatMap.bind(this);
    this.addPopup = this.addPopup.bind(this);
    this.addDots = this.addDots.bind(this);
    this.loadSubservices = this.loadSubservices.bind(this);
  }

  componentDidMount() {
    const { number_of_layers } = this.props;
    if (number_of_layers >= 3) {
      this.message('info', 'You\'ve exceeded the number of possible layers (3)');
      return;
    }
    this.loadSubservices();
  }

  componentWillUnmount() {
    this.removeLayer();
  }

  async loadSubservices() {
    console.log('Loading');
    const { subservices } = this.props;
    const promises = subservices.map((subservice) => new Promise((resolve, reject) => {
      const name = subservice.instancename.split('!');
      const path = `!${name[1].trim()}!${name[2].trim()}`;
      try {
        BuildingsAPI.get_building_number(path)
          .then((building_instance) => {
            const building_number = building_instance[0].attvalue;
            try {
              const building = BuildingsAPI.get_building(building_number);
              if (!building) {
                resolve({});
              }
              const feature = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: building.latlng.reverse(),
                },
                properties: {
                  Value: Number(subservice.curval),
                  Description: `${building.name}: ${subservice.curval} ${subservice.units}`,
                },
              };
              resolve(feature);
            } catch (error) {
              reject(error);
            }
          });
      } catch (error) {
        reject(error);
      }
    }));
    let features = [];
    await Promise.all(promises)
      .then((tempFeatures) => {
        console.log('Loaded');
        features = tempFeatures;
      })
      .then(() => this.props.update('loading', false));
    this.addLayer(features);
  }

  /**
   * Adds a new layer to the map
   */
  addLayer(features) {
    console.log('Added')
    const { type, number_of_layers } = this.props;
    switch (type.trim().toLowerCase()) {
      case 'circles':
        this.addCircles(features);
        break;
      case 'heatmap':
        this.addHeatMap(features);
        break;
      case 'extruded dots':
        this.addExtrudedDots(features);
        break;
      case 'dots':
        this.addDots(features);
        break;
      default:
        this.addDots(features);
        break;
    }
    this.props.update('number_of_layers', number_of_layers + 1);
  }

  /**
   * Removes a layer from the map
   */
  removeLayer() {
    const { map, layerName, number_of_layers } = this.props;
    let count = 0;
    let mapLayer = map.getLayer(`${layerName}-layer-${count}`);
    while (mapLayer) {
      const tempLayerName = `${layerName}-layer-${count}`;
      if (map.getLayer(tempLayerName)) {
        // map.removeLayer(tempLayerName);
        map.setLayoutProperty(tempLayerName, 'visibility', 'none');
      }
      count += 1;
      mapLayer = map.getLayer(tempLayerName);
    }
    if (map.getSource(layerName)) {
      this.props.update('number_of_layers', number_of_layers - 1);
    }
  }

  addPopup(coordinates, html) {
    const { map } = this.props;
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<div>
          ${html}
        </div>`,
      )
      .addTo(map);
  }


  addCircles(features) {
    const { map, layerName } = this.props;
    map.addSource(layerName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });
    map.addLayer({
      id: `${layerName}-layer-0`,
      source: `${layerName}`,
      ...layersConfig.circles,
      paint: {
        'circle-color': this.getColor(),
      },
    });
    map.addLayer({
      id: `${layerName}-layer-1`,
      source: `${layerName}`,
      ...layersConfig.labels,
    });
  }

  addDots(features) {
    const { map, layerName } = this.props;
    if (map.getSource(layerName)) {
      map.getSource(layerName).setData(features);
      console.log('Set visibility for ' + layerName + ' to visible');
      let count = 0;
      let mapLayer = map.getLayer(`${layerName}-layer-${count}`);
      while (mapLayer) {
        const tempLayerName = `${layerName}-layer-${count}`;
        if (map.getLayer(tempLayerName)) {
          // map.removeLayer(tempLayerName);
          map.setLayoutProperty(tempLayerName, 'visibility', 'visible');
        }
        count += 1;
        mapLayer = map.getLayer(tempLayerName);
      }
      return;
    }
    map.addSource(`${layerName}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });
    map.addLayer({
      id: `${layerName}-layer-0`,
      source: `${layerName}`,
      ...layersConfig.dots,
      paint: {
        'circle-color': this.getColor(),
      },
    });
    map.addLayer({
      id: `${layerName}-layer-1`,
      source: `${layerName}`,
      ...layersConfig.labels,
    });
  }

  addExtrudedDots(features) {
    const { map, layerName } = this.props;
    // generate polygons around point
    const polygons = features.map((tempFeature) => {
      let feature = {
        type: 'Feature',
        properties: tempFeature.properties,
      };

      const { coordinates } = tempFeature.geometry;
      const offset = 0.0001;
      const n = offset * (Math.sqrt(2) / 2);
      const topLeft = [coordinates[0] + n, coordinates[1] + n];
      const topRight = [coordinates[0] + n, coordinates[1] - n];
      const botLeft = [coordinates[0] - n, coordinates[1] + n];
      const botRight = [coordinates[0] - n, coordinates[1] - n];

      feature = {
        ...feature,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              topLeft,
              topRight,
              botRight,
              botLeft,
              topLeft,
            ],
          ],
        },
      };

      return feature;
    });
    map.addSource(`${layerName}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: polygons,
      },
    });
    map.addLayer({
      id: `${layerName}-layer-0`,
      source: `${layerName}`,
      ...layersConfig.extrusion,
      paint: {
        'fill-extrusion-color': this.getColor(),
      },
    });
  }

  addHeatMap(features) {
    const { map, layerName } = this.props;
    map.addSource(`${layerName}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });
    map.addLayer({
      id: `${layerName}-layer-0`,
      source: `${layerName}`,
      ...layersConfig.heatmap,
      paint: {
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(255,255,255,0)',
          1, this.getColor(),
        ],
      },
    });
    map.addLayer({
      id: `${layerName}-layer-1`,
      source: `${layerName}`,
      ...layersConfig.labels,
    });
  }

  getColor() {
    const { colors, number_of_layers } = this.props;
    return colors[number_of_layers];
  }

  layerExists() {
    const { map, layerName } = this.props;
    const mapSource = map.getSource(`${layerName}`);
    if (typeof mapSource !== 'undefined') {
      // Remove map layer & source.
      return true;
    }
    return false;
  }

  message(messageType, message) {
    const { number_of_layers } = this.props;
    if (number_of_layers >= 3) {
      this.props.update('loading', false);
      this.props.update('message', message);
      this.props.update('messageType', messageType);
      setTimeout(() => {
        this.props.update('message', null);
        this.props.update('messageType', null);
      }, 3000);
    }
  }

  render() {
    return null;
  }
}

Layer.propTypes = {
  map: PropTypes.object,
  subservices: PropTypes.array,
  layers: PropTypes.object,
  type: PropTypes.string,
  layerName: PropTypes.string,
  number_of_layers: PropTypes.number,
  colors: PropTypes.array,
  getSource: PropTypes.func,
  addLayer: PropTypes.func,
  update: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
  update: (key, value) => dispatch(update(key, value)),
});

const mapStateToProps = (state) => ({
  map: state.map,
  type: state.type,
  colors: state.colors,
  layers: state.layers,
  number_of_layers: state.number_of_layers,
});

export default connect(mapStateToProps, mapDispatchToProps)(Layer);
