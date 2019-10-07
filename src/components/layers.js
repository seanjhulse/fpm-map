import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Layer from './layer';

import { update } from '../store/actions';

class Layers extends Component {
  constructor(props) {
    super(props);
    this.removeLayer = this.removeLayer.bind(this);
  }

  componentDidUpdate() {
    // if the layer gets deleted and we didn't catch it, lets remove it here
    Object.keys(this.props.layers).forEach((layerName) => {
      if (!this.props.layers[layerName]) {
        this.removeLayer(layerName);
      }
    });
  }

  /**
   * Removes a layer from the map
   */
  removeLayer(layerName) {
    const { map, number_of_layers } = this.props;
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
    if (map.getSource(layerName)) {
      map.removeSource(layerName);
      this.props.update('number_of_layers', number_of_layers - 1);
    }
  }

  render() {
    return (
      <div>
        {Object.keys(this.props.layers).map((layerName) => {
          const subservices = this.props.layers[layerName];
          if (subservices) {
            return <Layer key={layerName} layerName={layerName} subservices={subservices} />;
          }
          return null;
        })}
      </div>
    );
  }
}

Layers.propTypes = {
  layers: PropTypes.object,
  map: PropTypes.object,
  update: PropTypes.func,
  number_of_layers: PropTypes.number,
};

const mapStateToProps = (state) => ({
  layers: state.layers,
  map: state.map,
  number_of_layers: state.number_of_layers,
});

const mapDispatchToProps = (dispatch) => ({
  update: (key, value) => dispatch(update(key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layers);
