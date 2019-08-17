import React from 'react';

// import classes
import Building from './components/building';
import Toolbar from './components/toolbar';
import Subservices from './components/subservice';

// import redux
import { connect } from 'react-redux'
import { loadMap, updateBuilding, updateBuildingId, updateCoordinates } from './store/actions';

// import api
import UserAPI from './api/user';

// import data
import buildings from '../data/real/buildings.json';
import geojson from '../data/real/geojson.json';
import layers from './layers.json';

class Map extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			buildings: buildings,
		}

		this.initMapFeatures = this.initMapFeatures.bind(this);
		this.toggleLayer = this.toggleLayer.bind(this);
		this.updateLayers = this.updateLayers.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
		this.hoverHandler = this.hoverHandler.bind(this);
	}

	/**
	 * Initialize the app with a map instance
	 */
	componentDidMount() {
		// login
		UserAPI.login();

		mapboxgl.accessToken = 'pk.eyJ1IjoidXdtYWRpc29uLXVjb21tIiwiYSI6InlSb2xNMmcifQ.QdGExUkysAJkvrS6B4U2WA';

		const map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/light-v9',
			center: [-89.396127, 43.071299],
			zoom: 12,
			hash: true
		});
		this.props.loadMap(map);

		// add map functions
		map.on('mousemove', this.hoverHandler);
		map.on('click', this.clickHandler);
		map.addHeatMap = this.addHeatMap.bind(this);
		map.addCircles = this.addCircles.bind(this);
		map.addDots = this.addDots.bind(this);
		map.addExtrudedDots = this.addExtrudedDots.bind(this);
		map.addPopup = this.addPopup.bind(this);

		// load other features once map has loaded
		map.on('load', this.initMapFeatures);
	}

	componentWillUnmount() {
		this.map.remove();
	}

	initMapFeatures() {
		// add the building to the actual map
		this.props.map.addSource("fpm-buildings", {
			"type": "geojson",
			"data": geojson,
			"tolerance": 2
		});
		this.props.map.addLayer({
			"id": "fpm-buildings-layer",
			"type": "fill",
			"source": "fpm-buildings",
			"paint": {
				"fill-color": "#000",
				"fill-opacity": 0.15
			}
		});
		this.props.map.addSource("dane-country-regional-airport", {
			"type": "image",
			"url": "ParkingMap.png",
			"coordinates": [
				[-89.350331325, 43.139526080],
				[-89.34316356461, 43.13931344052],
				[-89.3435008941, 43.1280687150],
				[-89.3506683081, 43.1280797150],
			]
		});
		this.props.map.addLayer({
			"id": "overlay",
			"source": "dane-country-regional-airport",
			"type": "raster",
			"paint": {
				"raster-opacity": 0.75
			}
		});
		this.setState({ loading: false });
	}

	addCircles(features, layer) {
		this.props.map.addSource(`${layer}`, {
			'type': 'geojson',
			'data': {
				"type": "FeatureCollection",
				"features": features
			}
		});

		this.props.map.addLayer({
			"id": `${layer}-layer-0`,
			"source": `${layer}`,
			...layers.circles
		});

		this.props.map.addLayer({
			"id": `${layer}-layer-1`,
			"source": `${layer}`,
			...layers.labels
		});
	}

	addDots(features, layer) {
		this.props.map.addSource(`${layer}`, {
			'type': 'geojson',
			'data': {
				"type": "FeatureCollection",
				"features": features
			}
		});

		this.props.map.addLayer({
			"id": `${layer}-layer-0`,
			"source": `${layer}`,
			...layers.dots
		});

		this.props.map.addLayer({
			"id": `${layer}-layer-1`,
			"source": `${layer}`,
			...layers.labels
		});
	}

	addExtrudedDots(features, layer) {
		// generate polygons around point
		let polygons = features.map(tempFeature => {
			let feature = {
				type: "Feature",
				properties: tempFeature.properties
			};

			let coordinates = tempFeature.geometry.coordinates;
			let offset = 0.0001;
			let n = offset * Math.sqrt(2) / 2;
			let topLeft = [coordinates[0] + n, coordinates[1] + n];
			let topRight = [coordinates[0] + n, coordinates[1] - n];
			let botLeft = [coordinates[0] - n, coordinates[1] + n];
			let botRight = [coordinates[0] - n, coordinates[1] - n];
			
			feature = {
				...feature,
				geometry: {
					type: "Polygon",
					coordinates: [
						[
							topLeft,
							topRight,
							botRight,
							botLeft,
							topLeft
						]
					]
				}
			};

			return feature;
		})

		this.props.map.addSource(`${layer}`, {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: polygons,
			}
		});

		this.props.map.addLayer({
			id: `${layer}-layer-0`,
			source: `${layer}`,
			...layers.extrusion
		});
	}

	addHeatMap(features, layer) {
		this.props.map.addSource(`${layer}`, {
			'type': 'geojson',
			'data': {
				"type": "FeatureCollection",
				"features": features
			}
		});

		this.props.map.addLayer({
			"id": `${layer}-layer-0`,
			"source": `${layer}`,
			...layers.heatmap
		});

		this.props.map.addLayer({
			"id": `${layer}-layer-1`,
			"source": `${layer}`,
			...layers.labels,
		});
	}

	addPopup(coordinates, html) {
		new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(
				`<div>
					${html}
				</div>`
			)
			.addTo(this.props.map);
	}

	clickHandler(e) {
		var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
		var features = this.props.map.queryRenderedFeatures(bbox);
		var nearestFeature = features.filter(feature => feature.layer.source === 'fpm-buildings')[0];
		if (nearestFeature && nearestFeature.properties.id) {
			this.props.updateBuilding(this.state.buildings[nearestFeature.properties.id]);
			this.props.updateBuildingId(nearestFeature.properties.id);
			this.props.updateCoordinates(e.lngLat);
		}
	}

	hoverHandler(e) {
		var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
		var features = this.props.map.queryRenderedFeatures(bbox);
		var nearestFeature = features.filter(feature => feature.properties && feature.properties.key)[0];
		if (nearestFeature && nearestFeature.properties.key) {
			if (this.state.hoverPopup) this.state.hoverPopup.remove();
			// this.createHoverPopup(e.lngLat, features);
		}
	}

	updateLayers(type, subtype, active) {
		const services = {
			...this.state.services,
			[type + subtype]: {
				type: type, subtype: subtype
			}
		};
		this.setState({ services: services });
		this.toggleLayer(type + subtype, active);
	}

	toggleLayer(layer, active) {
		let layerCount = 0;
		let currentLayer = `${layer}-layer-${layerCount}`;
		let layerExists = this.props.map.getLayer(currentLayer);

		while (layerExists) {
			if (active) {
				this.props.map.setLayoutProperty(currentLayer, 'visibility', 'visible');
			} else {
				this.props.map.setLayoutProperty(currentLayer, 'visibility', 'none');
			}
			layerCount = layerCount + 1;
			currentLayer = `${layer}-layer-${layerCount}`;
			layerExists = this.props.map.getLayer(currentLayer);
		}
	}

	render() {
		if (!this.state.loading) {
			return (
				<div>
					<div id="map"></div>
					{/* <Toolbar updateLayers={this.updateLayers} /> */}
					<Building />
					<Subservices />
					<Toolbar />
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

const mapDispatchToProps = dispatch => {
	return {
		loadMap: map => dispatch(loadMap(map)),
		updateBuilding: building => dispatch(updateBuilding(building)),
		updateBuildingId: building_id => dispatch(updateBuildingId(building_id)),
		updateCoordinates: coordinates => dispatch(updateCoordinates(coordinates))
	}
}

const mapStateToProps = state => {
	return {
		map: state.map,
		services: state.services,
		building_id: state.building_id,
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);