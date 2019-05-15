import React, { Component } from 'react';
import ServicesAPI from '../api/services';

class Layer extends Component {
	constructor(props) {
		super(props);

		let map = this.props.context;
		this.state = {
			layers: {
				"addCircles": map.addCircles,
				"addDots": map.addDots,
				"addExtrudedDots": map.addExtrudedDots,
				"addHeatMap": map.addHeatMap,
			}
		}

		this.addLayer = this.addLayer.bind(this);
	}

	componentDidMount() {
		ServicesAPI.get(this.props.serviceType, this.props.subType.split("-").join(" ").replace(/\b\w/g, l => l.toUpperCase()))
			.then(features => this.addLayer(features))
	}

	addLayer(features) {
		const layerName = this.props.type + this.props.subType;
		const layerFunc = this.state.layers[this.props.layerType];

		if (!layerFunc) console.error("Function DNE. Please check layer file, maps.js, and layers.json to ensure the function exists.");
		layerFunc(features, layerName);
	}

	render() {
		return null;
	}
}

export default Layer;