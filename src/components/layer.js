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
    this.getRange = this.getRange.bind(this);
  }

  componentDidMount() {
    this.loadSubservices();
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
    // eslint-disable-next-line no-undef
    this.removeLayer();
  }

  loadSubservices() {
    const { subservices } = this.props;
    const promises = subservices.map((subservice) => new Promise((resolve) => {
      // grab the cached building
      // eslint-disable-next-line no-undef
      const cachedBuilding = JSON.parse(localStorage.getItem(subservice.instanceid));
      if (cachedBuilding) {
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: cachedBuilding.latlng.reverse(),
          },
          properties: {
            Value: Number(subservice.curval),
            Description: `${cachedBuilding.name}: ${subservice.curval} ${subservice.units}`,
          },
        };
        // just use cached values if they exist
        resolve(feature);
        return;
      }

      // we don't have the building cached. We need to get it.
      const name = subservice.instancename.split('!');
      const path = `!${name[1].trim()}!${name[2].trim()}`;
      try {
        BuildingsAPI.get_building_number(path)
          .then((building_instance) => {
            const building_number = building_instance[0].attvalue;
            return this.props.buildings[building_number];
          })
          .then((building) => {
            try {
              if (!building) {
                throw new Error('Building ID does not exist');
              }

              // eslint-disable-next-line no-undef
              localStorage.setItem(subservice.instanceid, JSON.stringify(building));

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
              // we resolve an error with an empty object
              resolve({});
            }
          });
      } catch (error) {
        resolve({});
      }
    }));
    // now we want to add the features array we've loaded
    Promise.all(promises)
      .then((features) => {
        this.props.update('loading', false);
        this.addLayer(features);
      });
  }

  /**
   * Adds a new layer to the map
   */
  addLayer(features) {
    const {
      map,
      type,
      layerName,
      number_of_layers,
    } = this.props;

    if (map.getSource(layerName)) {
      this.updateLayer(features);
      return;
    }

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
   * Updates an existing layer
   * @param {Array} features
   */
  updateLayer(features) {
    const { map, layerName } = this.props;
    if (map.getSource(layerName)) {
      map.getSource(layerName).setData({
        type: 'FeatureCollection',
        features,
      });
    }
  }

  /**
   * Removes a layer from the map
   */
  removeLayer() {
    const { map, layerName, number_of_layers } = this.props;
    let count = 0;
    let tempLayerName = `${layerName}-layer-${count}`;
    let mapLayer = map.getLayer(tempLayerName);
    while (mapLayer) {
      if (map.getLayer(tempLayerName)) {
        map.removeLayer(tempLayerName);
      }
      count += 1;
      tempLayerName = `${layerName}-layer-${count}`;
      mapLayer = map.getLayer(tempLayerName);
    }
    map.removeSource(layerName);
    this.props.update('number_of_layers', number_of_layers - 1);
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
    const { max, min } = this.getRange(features);

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
        ...layersConfig.circles.paint,
        // ((value - min) / (max - min)) * 100
        'circle-radius': ['*', ['/', ['-', ['get', 'Value'], min], ['-', max, min]], 100],
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
        ...layersConfig.dots.paint,
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
    const { max, min } = this.getRange(features);

    // generate polygons around point
    const polygons = [];
    features.forEach((tempFeature) => {
      if (!tempFeature || !tempFeature.geometry) {
        return;
      }
      const feature = {
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

      polygons.push({
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
      });
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
        ...layersConfig.extrusion.paint,
        // ((value - min) / (max - min)) * 300
        'fill-extrusion-height': ['*', ['/', ['-', ['get', 'Value'], min], ['-', max, min]], 300],
        'fill-extrusion-color': this.getColor(),
      },
    });
    map.addLayer({
      id: `${layerName}-layer-1`,
      source: `${layerName}`,
      ...layersConfig.labels,
    });
  }

  addHeatMap(features) {
    const { map, layerName } = this.props;
    const { average, max, min } = this.getRange(features);

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
        ...layersConfig.heatmap.paint,
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'Value'],
          min, 0.25,
          average, 0.75,
          max, 0.85,
        ],
      },
    });

    map.addLayer({
      id: `${layerName}-layer-1`,
      source: `${layerName}`,
      ...layersConfig.heatmap_circles,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15, [
            'interpolate',
            ['linear'],
            ['get', 'Value'],
            Number(min), 1,
            Number(average), 15,
            Number(max), 20,
          ],
          20, [
            'interpolate',
            ['linear'],
            ['get', 'Value'],
            Number(min), 20,
            Number(average), 35,
            Number(max), 40,
          ],
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'Value'],
          Number(min), 'rgba(33,102,172,0.25)',
          Number(average), 'rgba(178,24,43,0.65)',
          Number(max), 'rgba(178,24,43,0.85)',
        ],
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['get', 'Value'],
          Number(min), 0.25,
          Number(average), 0.75,
          Number(max), 1,
        ],
      },
    });
    map.addLayer({
      id: `${layerName}-layer-2`,
      source: `${layerName}`,
      ...layersConfig.labels,
    });
  }

  getColor() {
    const { colors, number_of_layers } = this.props;
    return colors[number_of_layers];
  }

  /**
   * Gets the minimum and maximum feature
   * @param {Array} features
   * @returns {Object} max and min as object
   */
  getRange(features) {
    let max = Number.MIN_SAFE_INTEGER;
    let min = Number.MAX_SAFE_INTEGER;
    let total = 0;
    let count = 0;
    let average = 1;

    features.forEach((feature) => {
      if (!feature || !feature.properties) return;

      const value = feature.properties.Value;
      if (value < min && value > 0) {
        min = value;
      }
      if (value > max) {
        max = value;
      }

      if (value > 0) {
        count += 1;
        total += value;
      }
    });

    // if the range isn't available, we want to keep it to just 1
    if (max === Number.MIN_SAFE_INTEGER) max = 1;
    if (min === Number.MAX_SAFE_INTEGER) min = 1;

    average = total / count;

    return { average, max, min };
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
  buildings: PropTypes.object,
  type: PropTypes.string,
  layerName: PropTypes.string,
  number_of_layers: PropTypes.number,
  colors: PropTypes.array,
  getSource: PropTypes.func,
  addLayer: PropTypes.func,
  update: PropTypes.func,
  loading: PropTypes.bool,
};

const mapDispatchToProps = (dispatch) => ({
  update: (key, value) => dispatch(update(key, value)),
});

const mapStateToProps = (state) => ({
  map: state.map,
  type: state.type,
  colors: state.colors,
  layers: state.layers,
  loading: state.loading,
  number_of_layers: state.number_of_layers,
  buildings: state.buildings,
});

export default connect(mapStateToProps, mapDispatchToProps)(Layer);
