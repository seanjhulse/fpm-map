import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layer from './layer';

class Layers extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        {Object.keys(this.props.layers).map(layer => {
          return Object.keys(this.props.layers[layer]).map(subservice => {
            return <Layer key={subservice} layer={layer} subservice={subservice} />
          })
        })}
      </div>
    )
  }
};


const mapStateToProps = state => {
  return {
    layers: state.layers
  }
};

export default connect(mapStateToProps)(Layers);