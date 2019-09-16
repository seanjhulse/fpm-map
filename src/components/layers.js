import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Layer from './layer';

class Layers extends Component {
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
};

const mapStateToProps = (state) => ({
  layers: state.layers,
});

export default connect(mapStateToProps)(Layers);
