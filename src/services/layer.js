import React, { Component } from 'react';
import { connect } from 'react-redux';

class Layer extends Component {
	constructor(props) {
		super(props);

		let { map } = this.props;
		this.state = {
			mapFunctions: {
				"addCircles": map.addCircles,
				"addDots": map.addDots,
				"addExtrudedDots": map.addExtrudedDots,
				"addHeatMap": map.addHeatMap,
			}
		}

		this.addLayer = this.addLayer.bind(this);
	}

	componentDidMount() {
		console.log(this);
	}

	addLayer(features) {
		const layerName = this.props.type + this.props.subtype;
		const mapFunction = this.state.mapFunctions[this.props.layertype];

		if (!mapFunction) console.error("Function does not exist. Please check layer file, maps.js, and layers.json to ensure the function exists.");
		console.log(layerName);
		mapFunction(features, layerName);
	}

	render() {
		return null;
	}
}

const mapStateToProps = state => {
	return {
		map: state.map
	}
};

export default connect(mapStateToProps)(Layer);