import React, { Component } from 'react';
import Layer from './layer';

class Services extends Component {
	layers = {
		"Compressed Air": "addExtrudedDots",
		"Return Temp": "addHeatMap",
		"Supply Temp": "addHeatMap",
		"Flow": "addExtrudedDots",
	}
	render() {
		if (!this.props.type || !this.props.subtype) return null;
		const layertype = this.layers[this.props.subtype];
		return <Layer type={this.props.type} subtype={this.props.subtype} layertype={layertype} />;
	}
}

export default Services;