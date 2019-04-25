import React, { Component } from 'react';
import AirPressure from './air_pressure';

class Compressors extends Component {
	layers = {
		"air-pressure": AirPressure
	}
	render() {
		const Layer = this.layers[this.props.layer];
		return <Layer buildings={this.props.buildings} layer={this.props.layer} />;
	}
}

export default Compressors;