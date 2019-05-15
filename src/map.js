import React from 'react';

// import context
import { MapContext } from './map_context';

// import classes
import Building from './building';
import Services from './services';
import Toolbar from './toolbar';

// import data
import buildings from './data/real/buildings.json';
import geojson from './data/real/geojson.json';
import layers from './layers.json';

class Map extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			buildings: buildings,
			services: {},
			building_id: undefined
		}

		this.initMapFeatures = this.initMapFeatures.bind(this);
		this.toggleLayer = this.toggleLayer.bind(this);
		this.updateLayers = this.updateLayers.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
		this.hoverHandler = this.hoverHandler.bind(this);
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
		this.map.addSource("dane-country-regional-airport", {
			"type": "image",
			"url": "ParkingMap.png",
			"coordinates": [
				[-89.350331325, 43.139526080],
				[-89.34316356461, 43.13931344052],
				[-89.3435008941, 43.1280687150],
				[-89.3506683081, 43.1280797150],
			]
		})

		this.map.addLayer({
			"id": "overlay",
			"source": "dane-country-regional-airport",
			"type": "raster",
			"paint": {
				"raster-opacity": 0.75
			}
		});


		this.map.on('mousemove', this.hoverHandler);
		this.map.on('click', this.clickHandler);
		this.map.addHeatMap = this.addHeatMap.bind(this);
		this.map.addCircles = this.addCircles.bind(this);
		this.map.addDots = this.addDots.bind(this);
		this.map.addExtrudedDots = this.addExtrudedDots.bind(this);
	}

	addCircles(features, layer) {
		this.map.addSource(`${layer}`, {
			'type': 'geojson',
			'data': {
				"type": "FeatureCollection",
				"features": features
			}
		});

		this.map.addLayer({
			"id": `${layer}-layer-0`,
			"source": `${layer}`,
			...layers.circles
		});

		this.map.addLayer({
			"id": `${layer}-layer-1`,
			"source": `${layer}`,
			...layers.labels
		});
	}

	addDots(features, layer) {
		this.map.addSource(`${layer}`, {
			'type': 'geojson',
			'data': {
				"type": "FeatureCollection",
				"features": features
			}
		});

		this.map.addLayer({
			"id": `${layer}-layer-0`,
			"source": `${layer}`,
			...layers.dots
		});

		this.map.addLayer({
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

		this.map.addSource(`${layer}`, {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: polygons,
			}
		});

		this.map.addLayer({
			id: `${layer}-layer-0`,
			source: `${layer}`,
			...layers.extrusion
		});
	}

	addHeatMap(features, layer) {
		this.map.addSource(`${layer}`, {
			'type': 'geojson',
			'data': {
				"type": "FeatureCollection",
				"features": features
			}
		});

		this.map.addLayer({
			"id": `${layer}-layer-0`,
			"source": `${layer}`,
			...layers.heatmap
		});

		this.map.addLayer({
			"id": `${layer}-layer-1`,
			"source": `${layer}`,
			...layers.labels,
		});
	}

	clickHandler(e) {
		var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
		var features = this.map.queryRenderedFeatures(bbox);
		var nearestFeature = features.filter(feature => feature.layer.source === 'fpm-buildings')[0];
		if (nearestFeature && nearestFeature.properties.id) {
			this.setState({ building_id: nearestFeature.properties.id, coordinates: e.lngLat });
		} else {
			this.setState({ building: undefined, coordinates: undefined });
		}
	}

	hoverHandler(e) {
		var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
		var features = this.map.queryRenderedFeatures(bbox);
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
		let layerExists = this.map.getLayer(currentLayer);

		while (layerExists) {
			if (active) {
				this.map.setLayoutProperty(currentLayer, 'visibility', 'visible');
			} else {
				this.map.setLayoutProperty(currentLayer, 'visibility', 'none');
			}
			layerCount = layerCount + 1;
			currentLayer = `${layer}-layer-${layerCount}`;
			layerExists = this.map.getLayer(currentLayer);
		}
	}

	render() {
		if (!this.state.loading) {
			return (
				<div>
					<div id="map"></div>
					<Toolbar updateLayers={this.updateLayers} />

					<MapContext.Provider value={this.map}>
						<Building building_id={this.state.building_id} buildings={this.state.buildings} />
						{Object.values(this.state.services).map(service => {
							return <Services type={service.type} subtype={service.subtype} key={service.type + service.subtype} />
						})}
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