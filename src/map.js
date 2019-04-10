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
			buildings: []
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
			
			let AFCH = {
				'type': 'Feature',
				'properties': {
					'long_name': 'American Family Childrens Hospital',
					'name': 'AFCH',
					'id': 'AFCH'
				},
				'geometry': {
					'type': 'Polygon',
					'coordinates': [
						[
							[
								-89.43370521068572,
								43.077426430707604
							],
							[
								-89.4337347149849,
								43.076805370754315
							],
							[
								-89.43367570638657,
								43.07679949318526
							],
							[
								-89.4336810708046,
								43.07653500199419
							],
							[
								-89.43357646465302,
								43.076533042795916
							],
							[
								-89.433573782444,
								43.07646643001755
							],
							[
								-89.43354159593581,
								43.07642528679474
							],
							[
								-89.43350404500961,
								43.076393939558834
							],
							[
								-89.43343162536621,
								43.07636651071424
							],
							[
								-89.43337261676788,
								43.07635475549135
							],
							[
								-89.43330556154251,
								43.076368469917824
							],
							[
								-89.43323850631714,
								43.07639589876153
							],
							[
								-89.43320363759995,
								43.07642724599645
							],
							[
								-89.43316608667374,
								43.07646447081708
							],
							[
								-89.43314731121063,
								43.07651345080978
							],
							[
								-89.43316072225569,
								43.07654675718249
							],
							[
								-89.43307220935822,
								43.07654675718249
							],
							[
								-89.43306148052216,
								43.077420553198095
							],
							[
								-89.43370521068572,
								43.077426430707604
							]
						]
					]
				}
			};

			let WARF = {
				'type': 'Feature',
				'properties': {
					'long_name': 'Wisconsin Alumni Research Foundation',
					'name': 'WARF',
					'id': 'WARF'
				},
				'geometry': {
					'type': 'Polygon',
					'coordinates': [
						[
							[
								-89.42623794078827,
								43.07641744998727
							],
							[
								-89.4262433052063,
								43.07614707951554
							],
							[
								-89.4262084364891,
								43.07611181371391
							],
							[
								-89.42581951618195,
								43.076115732137325
							],
							[
								-89.42577928304672,
								43.07613532425061
							],
							[
								-89.42577391862869,
								43.07614512030488
							],
							[
								-89.42575514316559,
								43.07614512030488
							],
							[
								-89.42575514316559,
								43.076217611057984
							],
							[
								-89.42577123641968,
								43.07621565184953
							],
							[
								-89.42610383033752,
								43.07646643001755
							],
							[
								-89.42618966102599,
								43.07646643001755
							],
							[
								-89.42618966102599,
								43.07645663401462
							],
							[
								-89.42622989416121,
								43.076439001205415
							],
							[
								-89.42623794078827,
								43.07641744998727
							]
						]
					]
				}
			}

			// add the building to the actual map
			map.addSource("fpm-buildings", {
				"type": "geojson",
				"data": {
					"type": "FeatureCollection",
					"features": [
						AFCH,
						WARF
					]
				}
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

			that.setState({ buildings: [AFCH, WARF] });
		});

	}

	render() {
		if (this.state.map) {
			// get the buildings
			let buildings = this.state.buildings.map((building) => {
				let name = building.properties.name;
				return <Building key={`building-${name}`} building={building} name={name} />;
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