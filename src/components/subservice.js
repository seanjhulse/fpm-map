import React, { Component } from 'react';
import { connect } from 'react-redux';
import MapAPI from '../api/map';

class Subservices extends Component {
  constructor(props) {
    super(props);

    this.removeSubservice = this.removeSubservice.bind(this);
  }

  componentDidUpdate() {
    this.removeSubservice();

    const { map } = this.props;
    const features = [];
    MapAPI.addLayer(map, features, 'Circles', 'subservices');
  }

  removeSubservice() {
    const { map } = this.props;
    let layerCount = 0;
    let currentLayer = `subservices-layer-${layerCount}`;
    let layerExists = map.getLayer(currentLayer);

    while (layerExists) {
      map.removeLayer(currentLayer);
      layerCount += 1;
      currentLayer = `subservices-layer-${layerCount}`;
      layerExists = map.getLayer(currentLayer);
    }

    if (map.getSource('subservices')) {
      map.removeSource('subservices');
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => ({
    subservices: state.subservices,
    map: state.map,
    building: state.building,
  });

export default connect(mapStateToProps)(Subservices);
