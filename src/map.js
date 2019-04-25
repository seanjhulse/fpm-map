import React from 'react';
import { MapContext } from './map_context';
import API from './api';
import Toolbar from './toolbar';
import Layers from './layers/layers';
import buildings from './data/buildings.json';
import chad_points from './data/chad_points.json';
import chads from './data/chads.json';
import geojson from './data/geojson.json';

class Map extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			layer: undefined,
			layer_type: undefined,
			buildings: buildings,
			popup: undefined
		}

		this.toggleLayer = this.toggleLayer.bind(this);
		this.initMapFeatures = this.initMapFeatures.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
		this.createPopup = this.createPopup.bind(this);
	}

	initMapFeatures() {
		this.setState({ loading: false });

		// add the building to the actual map
		this.map.addSource("fpm-buildings", {
			"type": "geojson",
			"data": geojson,
			"tolerance": 2
		});
		this.map.addLayer({
			"id": "fpm-buildings-layer",
			"type": "fill",
			"source": "fpm-buildings",
			"paint": {
				"fill-color": "#000",
				"fill-opacity": 0.15
			}
		});
		this.map.on('mousemove', this.clickHandler);
	}

	clickHandler(e) {
		var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
		var features = this.map.queryRenderedFeatures(bbox);
		var nearestFeature = features[0];
		if (nearestFeature.properties.key) {
			if (this.state.popup) this.state.popup.remove();
			this.createPopup(e.lngLat, nearestFeature.properties.key);
		}
	}

	createPopup(coordinates, key) {
		let map = this.map;
		let that = this;
		this.findCHaDPoints(key.split("/")[0])
			.then(chads => chads.filter(chad => chad)) // remove undefined
			.then(chads => this.findChads(chads)) // grabs chads based on id
			.then(chads => {
				let html = chads.map(chad => {
					let path = chad.path;
					path = path.split("!").slice(2)
					return `<div class="fpm-popup">
							<h1><span class="popup-title">${path[0]}</span></h1>
							<p>
								${path[1]} - ${path[2]}
								<br/>
								${chad.name}
							</p>
						</div>`;
				})
				if (html.length <= 0) {
					html = ["We couldn't find any information about this point"]
				}
				let popup = new mapboxgl.Popup()
					.setLngLat(coordinates)
					.setHTML(`<div class="fpm-popup-container">${html.join("")}</div>`)
					.addTo(map);
				that.setState({ popup: popup });
			})
			.catch(error => console.error(error));
	}

	findChads(chadInstances) {
		return new Promise(function (resolve, reject) {
			resolve(chads.filter(chad => chadInstances.includes(chad.instanceid)))
		})
	}

	findCHaDPoints(pointname) {
		console.log("searching for", pointname);
		return new Promise(function (resolve, reject) {
			let keys = Object.keys(chad_points).map(chadInstanceId => {
				let chad = chad_points[chadInstanceId];
				if (chad && chad[0] && chad[0].ptcode.indexOf(pointname) !== -1) {
					return chadInstanceId;
				}
			})
			resolve(keys);
		});
	}

	componentDidMount() {
		mapboxgl.accessToken = 'pk.eyJ1IjoidXdtYWRpc29uLXVjb21tIiwiYSI6InlSb2xNMmcifQ.QdGExUkysAJkvrS6B4U2WA';

		this.map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/light-v9',
			center: [-89.396127, 43.071299],
			zoom: 12,
			hash: true
		});
		this.map.on('load', this.initMapFeatures);
	}

	componentWillUnmount() {
		this.map.remove();
	}

	toggleLayer(layer, layer_type, active) {
		if (!active) {
			console.log("Removing", layer);
			this.map.removeLayer(layer + '-layer');
			this.map.removeLayer(layer + '-points');
			this.map.removeLayer(layer + '-labels');
			this.map.removeSource(layer);
			this.setState({ layer: undefined, layer_type: undefined });
		} else {
			this.setState({ layer: layer, layer_type: layer_type });
		}
	}

	render() {
		if (!this.state.loading) {
			return (
				<div>
					<div id="map"></div>
					<Toolbar toggleLayer={this.toggleLayer} />
					<MapContext.Provider value={this.map}>
						<Layers layer_type={this.state.layer_type} layer={this.state.layer} buildings={this.state.buildings} />
					</MapContext.Provider>
				</div>
			);
		} else {
			return (
				<div>
					<div id="map"></div>
					<img id="loader" src="loader.gif" />
				</div>
			);
		}
	}
};


export default Map;