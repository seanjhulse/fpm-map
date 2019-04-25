import React, { Component } from 'react';
import { MapContext } from '../../map_context';
import API from '../../api';

class AirPressure extends Component {
	constructor(props) {
		super(props);
		this.state = {
			type: "Compressed Air",
			search_term: "PRESS"
		}
	}

	componentDidMount() {
		let map = this.context;
		let that = this;
		API.getAllCHaDDataPoints(this.state.type)
			.then(points => points.filter(point => !point || point.description.indexOf(that.state.search_term) !== -1))
			.then(points => {
				let features = [];
				points.map(point => {
					if (point.pointname.split("/")[1]) {
						var buildingNumber = point.pointname.split("/")[1].split("_")[1].split("-")[0];
					} else {
						var buildingNumber = point.pointname.split(".")[2].split("-")[0];
					}

					if (!that.props.buildings[buildingNumber]) return;

					let coordinates = [that.props.buildings[buildingNumber].latlng[1], that.props.buildings[buildingNumber].latlng[0]];

					let feature = {
						"type": "Feature",
						"properties": {
							"name": point.description + ": " + point.value,
							"value": parseFloat(point.value),
							"key": point.pointname
						},
						"geometry": {
							"type": "Point",
							"coordinates": coordinates
						}
					}
					features.push(feature);
				})

				features.sort((a, b) => parseFloat(b.properties.value) - parseFloat(a.properties.value));

				map.addSource(`${that.props.layer}`, {
					'type': 'geojson',
					'data': {
						"type": "FeatureCollection",
						"features": features
					},
					"cluster": false
				});

				map.addLayer({
					"id": `${that.props.layer}-layer`,
					"type": "heatmap",
					"source": `${that.props.layer}`,
					"paint": {
						// increase weight
						'heatmap-weight': {
							property: 'value',
							type: 'exponential',
							stops: [
								[38, 0],
								[55, 1],
							]
						},
						// increase intensity as zoom level increases
						'heatmap-intensity': {
							stops: [
								[12, 1],
								[17, 2],
								[22, 3]
							]
						},
						// assign color values be applied to points depending on their density
						'heatmap-color': [
							'interpolate',
							['linear'],
							['heatmap-density'],
							0, "rgba(33,102,172,0)",
							0.2, "rgb(103,169,207)",
							0.4, "rgb(209,229,240)",
							0.6, "rgb(253,219,199)",
							0.8, "rgb(239,138,98)",
							1, "rgb(178,24,43)"
						],
						// increase radius as zoom increases
						'heatmap-radius': {
							stops: [
								[10, 100],
								[22, 150]
							]
						},
						// decrease opacity to transition into the circle layer
						'heatmap-opacity': {
							default: 1,
							stops: [
								[8, 1],
								[22, 0.5]
							]
						},
					}
				});

				map.addLayer({
					"id": `${that.props.layer}-points`,
					"type": "circle",
					"source": `${that.props.layer}`,
					"paint": {
						// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
						// with three steps to implement three types of circles:
						//   * Blue, 20px circles when point count is less than 100
						//   * Yellow, 30px circles when point count is between 100 and 750
						//   * Pink, 40px circles when point count is greater than or equal to 750
						"circle-color": {
							"property": "value",
							stops: [
								[40, 'rgba(255,255,255,0)'],
								[50, '#ffb8b8'],
								[80, "#ff1d1d"]
							]
						},
						"circle-blur": 1,
						"circle-opacity": 0.5,
						"circle-radius": [
							"step",
							["get", "value"],
							10,
							40,
							20,
							80,
							50
						]
					}
				});

				map.addLayer({
					"id": `${that.props.layer}-labels`,
					"type": "symbol",
					"source": `${that.props.layer}`,
					"cluster": false,
					"layout": {
						"text-field": ['format',
							['get', 'name'], {
								'font-scale': 1.25,
								'text-color': 'rgba(255,255,255,1)',
								'text-font': ['literal', ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']]
							}
						]
					}
				});
			})

	}

	render() {
		console.log(`Loaded ${this.props.layer}...`);
		return null;
	}
}
AirPressure.contextType = MapContext;

export default AirPressure;