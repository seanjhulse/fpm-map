import React, { Component } from 'react';
import { connect } from 'react-redux';
import layersConfig from '../api/layers.json';
import BuildingsAPI from '../api/building';
import {
  update,
  updateLayers
} from '../store/actions';

class Layer extends Component {
  constructor(props) {
    super(props);
    this.toggleLayer = this.toggleLayer.bind(this);
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
    this.loadSubservices();
  }

  componentDidUpdate() {
    const { layers, layer, subservice } = this.props;
    const currentLayer = layers[layer][subservice];
    if (currentLayer.loaded) {
      this.toggleLayer();
    }
  }

  loadSubservices() {
    const { layers, layer, subservice } = this.props;
    const currentLayer = layers[layer][subservice];
    const promises = currentLayer.data.map(subservice => {
      return new Promise((resolve, reject) => {
        const name = subservice.instancename.split('!');
        const path = `!${name[1].trim()}!${name[2].trim()}`
        try {
          BuildingsAPI.get_building_number(path)
            .then(building_instance => {
              const building_number = building_instance[0].attvalue;
              try {
                const building = BuildingsAPI.get_building(building_number);
                if (!building) {
                  resolve({});
                }
                const feature = {
                  "type": "Feature",
                  "geometry": {
                    "type": "Point",
                    "coordinates": building.latlng.reverse(),
                  },
                  "properties": {
                    "Value": Number(subservice.curval),
                    "Description": `${building.name}: ${subservice.curval} ${subservice.units}`
                  }
                };
                resolve(feature);
              } catch (error) {
                reject(error);
              }
            });
        } catch (error) {
          reject(error);
        }
      });
    });
    Promise.all(promises)
      .then(features => {
        this.props.updateLayers(layer, subservice, {
          ...currentLayer,
          features: features,
          loaded: true,
          addLayer: true,
        });
      });
  }

  /**
   * Toggle map layer
   */
  toggleLayer() {
    const { map, layers, layer, subservice } = this.props;
    const currentLayer = layers[layer][subservice];
    const mapSource = map.getSource(`${layer}-${subservice}`);
    if (typeof mapSource !== 'undefined' && currentLayer.removeLayer) {
      // Remove map layer & source.
      this.removeLayer();
      return;
    }
    if (currentLayer.addLayer) {
      this.addLayer();
    }
  };


  /**
   * Adds a new layer to the map
   */
  addLayer() {
    const { type, colors, layers, layer, subservice, current_color, number_of_layers } = this.props;
    const currentLayer = layers[layer][subservice];
    if (number_of_layers >= 3) {
      console.error("You've exceeded the number of possible layers (3)");
      return;
    }

    switch (type.toLowerCase().trim()) {
      case 'circles':
        this.addCircles(colors[current_color]);
        break;
      case 'heatmap':
        this.addHeatMap(colors[current_color]);
        break;
      case 'extruded dots':
        this.addExtrudedDots(colors[current_color]);
        break;
      default:
        this.addDots(colors[current_color]);
        break;
    }
    this.props.update('current_color', current_color + 1);
    this.props.update('number_of_layers', number_of_layers + 1);
    this.props.updateLayers(layer, subservice, {
      ...currentLayer,
      addLayer: false,
    });
  };

  /**
   * Removes a layer from the map
   */
  removeLayer() {
    const { map, layer, subservice, current_color, number_of_layers } = this.props;
    let count = 0;
    let mapLayer = map.getLayer(`${layer}-${subservice}-layer-${count}`);
    while (mapLayer) {
      map.removeLayer(`${layer}-${subservice}-layer-${count}`);
      count = count + 1;
      mapLayer = map.getLayer(`${layer}-${subservice}-layer-${count}`);
    }
    map.removeSource(`${layer}-${subservice}`);
    this.props.updateLayers(layer, subservice, {
      active: false,
      data: null,
      features: null,
    });
    this.props.update('current_color', current_color - 1);
    this.props.update('number_of_layers', number_of_layers - 1);
  };

  addPopup(coordinates, html) {
    const { map } = this.props
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<div>
					${html}
				</div>`
      )
      .addTo(map);
  }


  addCircles(color) {
    const { map, layers, layer, subservice } = this.props;
    const currentLayer = layers[layer][subservice];
    map.addSource(`${layer}-${subservice}`, {
      'type': 'geojson',
      'data': {
        "type": "FeatureCollection",
        "features": currentLayer.features
      }
    });

    map.addLayer({
      "id": `${layer}-${subservice}-layer-0`,
      "source": `${layer}-${subservice}`,
      ...layersConfig.circles,
      "paint": {
        "circle-color": color
      }
    });

    map.addLayer({
      "id": `${layer}-${subservice}-layer-1`,
      "source": `${layer}-${subservice}`,
      ...layersConfig.labels
    });
  }

  addDots(color) {
    const { map, layers, layer, subservice } = this.props;
    const currentLayer = layers[layer][subservice];

    map.addSource(`${layer}-${subservice}`, {
      'type': 'geojson',
      'data': {
        "type": "FeatureCollection",
        "features": currentLayer.features
      }
    });

    map.addLayer({
      "id": `${layer}-${subservice}-layer-0`,
      "source": `${layer}-${subservice}`,
      ...layersConfig.dots,
      "paint": {
        "circle-color": color
      }
    });

    map.addLayer({
      "id": `${layer}-${subservice}-layer-1`,
      "source": `${layer}-${subservice}`,
      ...layersConfig.labels
    });
  }

  addExtrudedDots(color) {
    const { map, layers, layer, subservice } = this.props;
    const currentLayer = layers[layer][subservice];

    // generate polygons around point
    let polygons = currentLayer.features.map(tempFeature => {
      let feature = {
        type: "Feature",
        properties: tempFeature.properties
      };

      let coordinates = tempFeature.geometry.coordinates;
      let offset = 0.0001;
      let n = offset * Math.sqrt(2) / 2;
      let topLeft = [coordinates[0] + n, coordinates[1] + n];
      let topRight = [coordinates[0] + n, coordinates[1] - n];
      let botLeft = [coordinates[0] - n, coordinates[1] + n];
      let botRight = [coordinates[0] - n, coordinates[1] - n];

      feature = {
        ...feature,
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              topLeft,
              topRight,
              botRight,
              botLeft,
              topLeft
            ]
          ]
        }
      };

      return feature;
    })

    map.addSource(`${layer}-${subservice}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: polygons,
      }
    });

    map.addLayer({
      id: `${layer}-${subservice}-layer-0`,
      source: `${layer}-${subservice}`,
      ...layersConfig.extrusion,
      "paint": {
        "fill-extrusion-color": color
      }
    });
  }

  addHeatMap(color) {
    const { map, layers, layer, subservice } = this.props;
    const currentLayer = layers[layer][subservice];

    map.addSource(`${layer}-${subservice}`, {
      'type': 'geojson',
      'data': {
        "type": "FeatureCollection",
        "features": currentLayer.features
      }
    });

    map.addLayer({
      "id": `${layer}-${subservice}-layer-0`,
      "source": `${layer}-${subservice}`,
      ...layersConfig.heatmap,
      "paint": {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0, "rgba(255,255,255,0)",
          1, color
        ],
      }
    });

    map.addLayer({
      "id": `${layer}-${subservice}-layer-1`,
      "source": `${layer}-${subservice}`,
      ...layersConfig.labels,
    });
  }

  render() {
    return null;
  }
}


const mapDispatchToProps = dispatch => {
  return {
    update: (key, value) => dispatch(update(key, value)),
    updateLayers: (layerKey, serviceKey, value) => dispatch(updateLayers(layerKey, serviceKey, value)),
  }
}

const mapStateToProps = state => {
  return {
    colors: state.colors,
    current_color: state.current_color,
    layers: state.layers,
    map: state.map,
    number_of_layers: state.number_of_layers,
    type: state.type,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layer);