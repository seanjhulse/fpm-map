import React, { Component } from 'react';
import { connect } from 'react-redux';
import layers from '../api/layers.json';
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

  componentDidUpdate() {
    const { subservices, layer, map } = this.props;
    if (subservices.length > 0) {
      this.loadSubservices();
    } else {
      this.toggleLayer();
    }
  }

  loadSubservices() {
    const { subservices } = this.props
    const promises = subservices.map(subservice => {
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
        this.props.update('subservices', []);
        this.props.update('features', features);
      })
  }

  /**
   * Toggle map layer
   */
  toggleLayer() {
    const { map, layer } = this.props;
    const mapSource = map.getSource(layer);
    if (typeof mapSource !== 'undefined') {
      // Remove map layer & source.
      this.removeLayer();
      return;
    }
    if (layer) {
      this.addLayer();
    }
  };


  /**
   * Adds a new layer to the map
   */
  addLayer() {
    const { type, layer, colors, current_color, number_of_layers } = this.props;
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
    this.props.updateLayers(layer, {
      color: colors[current_color],
      type: type
    })
    this.props.update('current_color', current_color + 1);
    this.props.update('number_of_layers', number_of_layers + 1);
  };

  /**
   * Removes a layer from the map
   */
  removeLayer() {
    const { map, layer, current_color, number_of_layers } = this.props;
    let count = 0;
    let mapLayer = map.getLayer(`${layer}-layer-${count}`);
    while (mapLayer) {
      map.removeLayer(`${layer}-layer-${count}`);
      count = count + 1;
      mapLayer = map.getLayer(`${layer}-layer-${count}`);
    }
    map.removeSource(layer);
    this.props.updateLayers(layer, null);
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
    const { map, layer, features } = this.props;
    map.addSource(`${layer}`, {
      'type': 'geojson',
      'data': {
        "type": "FeatureCollection",
        "features": features
      }
    });

    map.addLayer({
      "id": `${layer}-layer-0`,
      "source": `${layer}`,
      ...layers.circles,
      "paint": {
        "circle-color": color
      }
    });

    map.addLayer({
      "id": `${layer}-layer-1`,
      "source": `${layer}`,
      ...layers.labels
    });
  }

  addDots(color) {
    const { map, layer, features } = this.props;
    map.addSource(`${layer}`, {
      'type': 'geojson',
      'data': {
        "type": "FeatureCollection",
        "features": features
      }
    });

    map.addLayer({
      "id": `${layer}-layer-0`,
      "source": `${layer}`,
      ...layers.dots,
      "paint": {
        "circle-color": color
      }
    });

    map.addLayer({
      "id": `${layer}-layer-1`,
      "source": `${layer}`,
      ...layers.labels
    });
  }

  addExtrudedDots(color) {
    const { map, layer, features } = this.props;
    // generate polygons around point
    let polygons = features.map(tempFeature => {
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

    map.addSource(`${layer}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: polygons,
      }
    });

    map.addLayer({
      id: `${layer}-layer-0`,
      source: `${layer}`,
      ...layers.extrusion,
      "paint": {
        "fill-extrusion-color": color
      }
    });
  }

  addHeatMap(color) {
    const { map, layer, features } = this.props;
    map.addSource(`${layer}`, {
      'type': 'geojson',
      'data': {
        "type": "FeatureCollection",
        "features": features
      }
    });

    map.addLayer({
      "id": `${layer}-layer-0`,
      "source": `${layer}`,
      ...layers.heatmap,
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
      "id": `${layer}-layer-1`,
      "source": `${layer}`,
      ...layers.labels,
    });
  }

  render() {
    return null;
  }
}


const mapDispatchToProps = dispatch => {
  return {
    update: (key, value) => dispatch(update(key, value)),
    updateLayers: (key, value) => dispatch(updateLayers(key, value)),
  }
}

const mapStateToProps = state => {
  return {
    colors: state.colors,
    current_color: state.current_color,
    features: state.features,
    layer: state.layer,
    layers: state.layers,
    map: state.map,
    subservices: state.subservices,
    number_of_layers: state.number_of_layers,
    type: state.type,
    update_layer: state.update_layer,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layer);