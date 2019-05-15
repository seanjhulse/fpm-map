import React, { Component } from 'react';
import { MapContext } from '../map_context';
import Layer from './layer';

class Services extends Component {
	types = {
		chillers: "Chilled Water",
		hotwater: "Hot Water",
		compressors: "Compressed Air",
	}
	layers = {
		"pressure": "addExtrudedDots",
		"return-temp": "addHeatMap",
		"supply-temp": "addHeatMap",
		"water-flow": "addExtrudedDots",
	}
	render() {
		if (!this.props.type || !this.props.subtype) return null;
		const serviceType = this.types[this.props.type];
		const layerType = this.layers[this.props.subtype];
		return <Layer type={this.props.type} subType={this.props.subtype} serviceType={serviceType} layerType={layerType} context={this.context} />;
	}
}
Services.contextType = MapContext;

export default Services;