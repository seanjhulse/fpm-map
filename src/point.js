import React, { Component } from 'react';
import { MapContext } from './map_context';
import API from './api';

const formatDateTime = function (date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

class Point extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
		}

		this.addToPopup = this.addToPopup.bind(this);
		this.createMarker = this.createMarker.bind(this);
	}

	componentDidMount() {
		API.getCurrentValues(this.props.point.ptcode, function (point) {
			this.setState({ point: point, loading: false });
			this.createMarker();
		}.bind(this));
	}

	addToPopup() {
		let title = document.createElement('h2');
		title.innerHTML = this.state.description.split(".").join(" ");
		this.props.popup.append(title);

		let date = document.createElement('span');
		date.classList.add('date');
		date.innerHTML = formatDateTime(new Date(this.state.time));
		this.props.popup.append(date);
		
		let value = document.createElement('p');
		value.innerHTML = parseFloat(this.state.value).toLocaleString() + " " + this.state.units;
		this.props.popup.append(value);

		let status = document.createElement('p');
		status.classList.add("status-" + this.state.status.replace(" ", "-").toLowerCase());
		status.innerHTML = this.state.status;
		this.props.popup.append(status);
	}

	/**
	 * creates a marker with some coordinate fuzzing so that they don't overlap too much
	 */
	createMarker() {
		console.log(this.state)
		let coordinates = this.props.coordinates;
		let coordinateOffsetX = parseFloat((Math.random() * (0.000100 + 0.000100) - 0.000100));
		let coordinateOffsetY = parseFloat((Math.random() * (0.000100 + 0.000100) - 0.000100));
		let coordinateX = parseFloat(coordinates[0]) + coordinateOffsetX;
		let coordinateY = parseFloat(coordinates[1]) + coordinateOffsetY;
		coordinates = [coordinateX, coordinateY];

		let el = document.createElement('div');
		el.innerHTML = this.state.point.value;
		el.classList.add('fpm-marker');

		this.context.getSource('points').setData({
			"type": "FeatureCollection",
			"features": [{
				"type": "Feature",
				"properties": { "name": this.state.point.value },
				"geometry": {
					"type": "Point",
					"coordinates": coordinates
				}
			}]
		})
	}

	render() {
		if (this.state.loading) return null;
		return null;
	}
}
Point.contextType = MapContext;

export default Point;