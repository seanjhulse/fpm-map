import React, { Component } from 'react';
import { connect } from 'react-redux'
import API from '../api/building';
import { updateSidebar, updateServices, updateBuilding } from '../store/actions';

class Building extends Component {
	constructor(props) {
		super(props);
		this.state = {
			building: null
		}
		this.flyToBuilding = this.flyToBuilding.bind(this);
		this.createBuilding = this.createBuilding.bind(this);
		this.removeBuilding = this.removeBuilding.bind(this);
	}

	componentDidUpdate() {
		const { building } = this.props;
		if (!this.state.building || this.state.building.building_number != building.building_number) {
			this.setState({ building: building },
				() => {
					this.removeBuilding();
					this.createBuilding();
					this.flyToBuilding();
					API.get_building_services(building.building_number, (services) => {
						this.props.updateServices(services);
					});
				}
			);
		}
	}
	
	createBuilding() {
		const { map, building } = this.props;
		map.addSource('custom-building', {
			"type": "geojson",
			"data": building.geojson
		});
		map.addLayer({
			"id": "custom-building-layer-0",
			"type": "fill",
			"source": "custom-building",
			"paint": {
				"fill-color": "#c5050c",
				"fill-opacity": 0.25
			}
		});
		map.addLayer({
			"id": "custom-building-layer-1",
			"source": "custom-building",
			"type": "fill-extrusion",
			"paint": {
				"fill-extrusion-color": "#c5050c",
				"fill-extrusion-height": 10,
				"fill-extrusion-base": 0,
				"fill-extrusion-opacity": 0.25
			}
		});
		this.props.updateSidebar(
			<div className="sidebar-header">
				{building.images.medium ?
					<img className="sidebar-header-image" src={building.images.medium} />
					:
					null
				}
				<div className="sidebar-header-overlay" />
				<div className="sidebar-header-text">
					<h1>{building.name}</h1>
					<p>{building.street_address}</p>
				</div>
			</div>
		);
	}

	removeBuilding() {
		const { map } = this.props;
		let layerCount = 0;
		let currentLayer = `custom-building-layer-${layerCount}`;
		let layerExists = map.getLayer(currentLayer);

		while (layerExists) {
			map.removeLayer(currentLayer);
			layerCount = layerCount + 1;
			currentLayer = `custom-building-layer-${layerCount}`;
			layerExists = map.getLayer(currentLayer);
		}

		if (map.getSource("custom-building")) {
			map.removeSource("custom-building");
		}
	}

	flyToBuilding() {
		const { map, building } = this.props;
		map.flyTo({
			center: building.latlng[0] > 0 ? building.latlng.reverse() : building.latlng,
			// pitch: 60, // pitch in degrees
			// bearing: Math.floor(Math.random() * (60 + 60)) - 60, // bearing in degrees
			// zoom: 17,
			// speed: 0.5, // make the flying slow
			// curve: 1, // change the speed at which it zooms out
			// // This can be any easing function: it takes a number between
			// // 0 and 1 and returns another number between 0 and 1.
			// easing: function (t) { return t; }
		});
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = dispatch => {
	return {
		updateSidebar: sidebar_content => dispatch(updateSidebar(sidebar_content)),
		updateServices: services => dispatch(updateServices(services)),
		updateBuilding: building => dispatch(updateBuilding(building)),
	}
}

const mapStateToProps = state => {
	return {
		map: state.map,
		building: state.building,
		building_id: state.building_id,
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Building);