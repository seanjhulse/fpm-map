import React, { Component } from 'react';
import { MapContext } from './map_context';
import CHaDInstances from './chad_instances';

class Building extends Component {
	constructor(props) {
		super(props);
		this.state = {
			clicked: false
		}
		this.onClickHandler = this.onClickHandler.bind(this);
	}

	componentDidMount() {
		this.onClickHandler();
	}

	onClickHandler() {
		// adds a click listener to our custom-buildings layer
		var that = this;
		this.context.on('click', function (e) {
			var bbox = [[e.point.x - 1, e.point.y - 1], [e.point.x + 1, e.point.y + 1]];
			var features = that.context.queryRenderedFeatures(bbox, { layers: ['fpm-buildings-layer'] });
			if (features.length > 0) {
				var feature = features[0]; // this represents the closest feature to the mouse inside that bbox
				if (that.props.name == feature.properties.name && !that.state.clicked) {
					that.setState({ clicked: true });
					return;
				}
				if (that.props.name != feature.properties.name) {
					that.setState({ clicked: false });
					return;
				}
			} else {
				that.setState({ clicked: false });
			}
		});
	}

	render() {
		if (!this.state.clicked) {
			return null;
		}
		return <CHaDInstances name={this.props.name} />
	}

}
Building.contextType = MapContext;

export default Building;