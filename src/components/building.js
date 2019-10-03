import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BuildingAPI from '../api/building';
import { update } from '../store/actions';

class Building extends Component {
  constructor(props) {
    super(props);
    this.state = {
      building: null,
    };
    this.flyToBuilding = this.flyToBuilding.bind(this);
    this.createBuilding = this.createBuilding.bind(this);
    this.removeBuilding = this.removeBuilding.bind(this);
  }

  componentDidUpdate() {
    const { building } = this.props;
    if (!this.state.building || this.state.building.building_number != building.building_number) {
      this.setState({ building },
        () => {
          this.removeBuilding();
          this.createBuilding();
          this.flyToBuilding();
          BuildingAPI.get_building_services(building.building_number)
            .then((services) => {
              this.props.update('services', services);
            });
        });
    }
  }

  createBuilding() {
    const { map, building } = this.props;
    map.addSource('custom-building', {
      type: 'geojson',
      data: building.geojson,
    });
    map.addLayer({
      id: 'custom-building-layer-0',
      type: 'fill',
      source: 'custom-building',
      paint: {
        'fill-color': '#c5050c',
        'fill-opacity': 0.25,
      },
    });
    map.addLayer({
      id: 'custom-building-layer-1',
      source: 'custom-building',
      type: 'fill-extrusion',
      paint: {
        'fill-extrusion-color': '#c5050c',
        'fill-extrusion-height': 10,
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.25,
      },
    });
    this.props.update('building', building);
  }

  removeBuilding() {
    const { map } = this.props;
    let layerCount = 0;
    let currentLayer = `custom-building-layer-${layerCount}`;
    let layerExists = map.getLayer(currentLayer);

    while (layerExists) {
      map.removeLayer(currentLayer);
      layerCount += 1;
      currentLayer = `custom-building-layer-${layerCount}`;
      layerExists = map.getLayer(currentLayer);
    }

    if (map.getSource('custom-building')) {
      map.removeSource('custom-building');
    }
  }

  flyToBuilding() {
    const { map, building } = this.props;
    map.flyTo({
      center: building.latlng[0] > 0 ? building.latlng.reverse() : building.latlng,
      // pitch: 60, // pitch in degrees
      // bearing: Math.floor(Math.random() * (60 + 60)) - 60, // bearing in degrees
      // zoom: 17,
      // speed: 0.5, // make the flying slow
      // curve: 1, // change the speed at which it zooms out
      // // This can be any easing function: it takes a number between
      // // 0 and 1 and returns another number between 0 and 1.
      // easing: function (t) { return t; }
    });
  }

  render() {
    return null;
  }
}

Building.propTypes = {
  building: PropTypes.object,
  building_id: PropTypes.string,
  map: PropTypes.object,
  update: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
  update: (key, value) => dispatch(update(key, value)),
});

const mapStateToProps = (state) => ({
  building: state.building,
  building_id: state.building_id,
  map: state.map,
});

export default connect(mapStateToProps, mapDispatchToProps)(Building);
