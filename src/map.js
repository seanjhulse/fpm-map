import React from 'react';
import Building from './building';
import { MapContext } from './map_context';

class Map extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			access_token: 'pk.eyJ1IjoidXdtYWRpc29uLXVjb21tIiwiYSI6InlSb2xNMmcifQ.QdGExUkysAJkvrS6B4U2WA',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [-89.396127, 43.071299],
			zoom: 12,
			// maxBounds: [
			// 	[-89.48547, 43.0405], 	// Southwest coordinates
			// 	[-89.325296, 43.120101] // Northeast coordinates
			// ],
			map: undefined, // intialize the map to empty
			CHaDInstanceName: undefined,
			buildings: [],
			clickedId: undefined
		}

	}




	componentDidMount() {
		// initialize the map object after the div has loaded
		mapboxgl.accessToken = this.state.access_token;
		var map = new mapboxgl.Map({
			container:	'map', // container id
			style:			this.state.style,
			center:			this.state.center,
			zoom: 			this.state.zoom,
			maxBounds:	this.state.maxBounds,
			hash:				true
		});

		var that = this;
		map.on('load', function () {
			document.getElementById('map').style.visibility = 'visible';
			that.setState({ map: map });
			
			fetch("https://map.wisc.edu/api/v1/map_objects/mapbox.geojson")
				.then((rawJSON) => rawJSON.json())
				.then((geojson) => that.setState({ buildings: geojson.features }))
				.catch((error) => console.log(error))

			// add the building to the actual map
			map.addSource("fpm-buildings", {
				"type": "geojson",
				"data": "https://map.wisc.edu/api/v1/map_objects/mapbox.geojson"
			});

			map.addLayer({
				"id": "fpm-buildings-layer",
				"type": "fill",
				"source": "fpm-buildings",
				"paint": {
					"fill-color": "#c5050c",
					"fill-opacity": 0.4
				}
			});
			
			map.on('click', function (e) {
				var bbox = [[e.point.x - 1, e.point.y - 1], [e.point.x + 1, e.point.y + 1]];
				var features = map.queryRenderedFeatures(bbox, { layers: ['fpm-buildings-layer'] });
				if (features.length > 0) {
					var feature = features[0]; // this represents the closest feature to the mouse inside that bbox
					if (that.state.clickedId != feature.properties.id) {
						that.setState({ clickedId: feature.properties.id });
					}
				} else {
					that.setState({ clickedId: undefined });
				}
			});

		});

	}

	render() {
		if (this.state.map) {
			// get the buildings
			let buildings = this.state.buildings.map((building) => {
				let id = building.properties.id;
				let clicked = id == this.state.clickedId && id != null;
				if (clicked) {
					console.log(building.properties.name, building.properties.id)
				}
				if (id == null) {
					id = "randomly-gen-id-" + Math.random();
				}
				return <Building key={`building-${id}`} building={building} id={id} clicked={clicked} />;
			});
			return (
				<div>
					<div id="map"></div>
					<MapContext.Provider value={this.state.map}>
						{buildings}
					</MapContext.Provider>
				</div>
			);
		} else {
			return (
				<div>
					<div id="map"></div>
					<div id="loader">
						<img src="loader.gif" />
					</div>
				</div>
			);
		}
	}
};

export default Map;