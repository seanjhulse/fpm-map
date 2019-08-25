import React from 'react';

// import classes
import Building from './components/building';
import Toolbar from './components/toolbar';

// import redux
import { connect } from 'react-redux'
import { loadMap, updateBuilding, updateBuildingId, updateCoordinates } from './store/actions';

// import api
import UserAPI from './api/user';

// import data
import buildings from '../data/real/buildings.json';
import geojson from '../data/real/geojson.json';

class Map extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			buildings: buildings,
		}

		this.initMapFeatures = this.initMapFeatures.bind(this);
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

	render() {
		if (!this.state.loading) {
			return (
				<div>
					<div id="map"></div>
					{/* <Toolbar updateLayers={this.updateLayers} /> */}
					<Building />
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