import React, { Component } from 'react';
import { MapContext } from './map_context';
import building_points from './data/ideal/building_points.json';

class Building extends Component {
	constructor() {
		super();
		this.state = {
			building_id: undefined,
			building: undefined,
			popup: undefined
		}
		this.flyToBuilding = this.flyToBuilding.bind(this);
		this.createBuilding = this.createBuilding.bind(this);
		this.removeBuilding = this.removeBuilding.bind(this);
		this.addPopup = this.addPopup.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.building_id !== this.props.building_id) {
			this.removeBuilding();
			this.setState({
				building_id: this.props.building_id,
				building: this.props.buildings[this.props.building_id]
			}, () => {
				this.createBuilding();
				this.flyToBuilding();
				this.addPopup();
			});
		}
	}
	
	createBuilding() {
		let map = this.context;
		map.addSource('custom-building', {
			"type": "geojson",
			"data": this.state.building.geojson
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
	}

	removeBuilding() {
		let map = this.context;
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
		let map = this.context;
		let coordinates = this.state.building.latlng;
		if (coordinates[0] < 0) coordinates = coordinates.reverse();
		
		map.flyTo({
			center: this.state.building.latlng.reverse(),
			pitch: 60, // pitch in degrees
			bearing: Math.floor(Math.random() * (60 + 60)) - 60,// bearing in degrees
			zoom: 18,
			speed: 0.5, // make the flying slow
			curve: 1, // change the speed at which it zooms out
			// This can be any easing function: it takes a number between
			// 0 and 1 and returns another number between 0 and 1.
			easing: function (t) { return t; }
		});
	}

	addPopup() {
		let map = this.context;
		let coordinates = this.state.building.latlng;
		let points = building_points[this.state.building_id];
		let html = '<h1>We couldn\'t find any information on this building</h1>';
		
		if (points) {
			html = points.map(point => {
				if(!point) return
				return `<h2>${point.ExtendedDescription}: ${point.Value} ${point.Units}</h2>`
			});
			html = html.join("")
		}

		let popup = new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(
				`<div>
					${html}
				</div>`
			)
			.addTo(map);
		
		this.setState({ popup: popup });
	}

	render() {
		return null;
	}
}
Building.contextType = MapContext;

export default Building;