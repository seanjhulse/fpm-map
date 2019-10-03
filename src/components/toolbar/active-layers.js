import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ActiveLayer from './active-layer';

class ActiveLayers extends Component {
  render() {
    if (Object.keys(this.props.layers).length <= 0) {
      return <p className='toolbar-empty-message'>No layers. Add (+) a layer.</p>;
    }
    return (
      <ul className="active-layers">
        {Object.keys(this.props.layers).map((layerName) => {
          if (!this.props.layers[layerName]) return null;
          return <ActiveLayer key={`active-layer-${layerName}`} layerName={layerName} />;
        })}
      </ul>
    );
  }
}

ActiveLayers.propTypes = {
  layers: PropTypes.object,
};

const mapStateToProps = (state) => ({
  layers: state.layers,
});

export default connect(mapStateToProps)(ActiveLayers);
