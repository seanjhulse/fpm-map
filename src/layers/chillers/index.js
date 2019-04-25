import React, { Component } from 'react';
import SupplyTemperature from './supply_temperature';
import VolumeRate from './volume_rate';

class Chillers extends Component {
	layers = {
		"supply-temperature": SupplyTemperature,
		"water-flow": VolumeRate
	}
	render() {
		const Layer = this.layers[this.props.layer];
		return <Layer buildings={this.props.buildings} layer={this.props.layer} />;
	}
}

export default Chillers;