import React, { Component } from 'react';
import CHaDInstances from './chad_instances';
import getMapObject from './map_objects';

class Building extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (!this.props.clicked) {
			return null;
		}
		return <CHaDInstances name={getMapObject(this.props.id)} />
	}

}

export default Building;