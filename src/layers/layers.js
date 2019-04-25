import React, { Component } from 'react';
import Chillers from './chillers/index.js';
import Compressors from './compressors/index.js';

class Layers extends Component {
	layer_types = {
		chillers: Chillers,
		compressors: Compressors
	}
	render() {
		if (!this.props.layer_type || !this.props.layer) return null;
		
		const LayerType = this.layer_types[this.props.layer_type];
		return <LayerType layer={this.props.layer} buildings={this.props.buildings} />
	}
}

export default Layers;