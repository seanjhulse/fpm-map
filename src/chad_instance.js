import React, { Component } from 'react';
import getCoordinates from './coordinates';
import { MapContext } from './map_context';
import Point from './point';

/**
 * CHaD instances represent a collection of eDNA points (which are really just
 * CHaD instances) at a single building with a single type. 
 * @prop {Object} instance (id, name, path, etc.)
 */
class CHaDInstance extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			points: {},
			marker: undefined
		}
		this.createDataPoints = this.createDataPoints.bind(this);
		this.markerClickHandler = this.markerClickHandler.bind(this);
		this.createPopup = this.createPopup.bind(this);
		this.removePopupContainers = this.removePopupContainers.bind(this);
		this.getCHaDInstanceDataPoints = this.getCHaDInstanceDataPoints.bind(this);
	}

	controller = new AbortController();

	componentDidMount() {
		this.getCHaDInstanceDataPoints();
	}

	componentWillUnmount() {
		this.controller.abort();
		this.removePopupContainers();
		if (this.state.marker) {
			this.state.marker.remove();
		}
	}

	getCHaDInstanceDataPoints() {
		let url = "http://ednaweb.fpm.wisc.edu/webservice/CHaD.asmx";
		let headers = new Headers();
		headers.append('Content-Type', 'text/xml');
		headers.append('Authorization', 'Basic ' + window.btoa("TODO: ADD AUTHORIZATION HEADER"));
		headers.append('SOAPAction', 'http://instepsoftware.com/webservices/GetCHaDInstanceDataPoints');

		let body =
			`<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<GetCHaDInstanceDataPoints xmlns="http://instepsoftware.com/webservices">
						<InstanceID>${this.props.instance.instanceid}</InstanceID>
					</GetCHaDInstanceDataPoints>
				</soap:Body>
			</soap:Envelope>`;

		fetch(url, {
			headers: headers,
			method: 'POST',
			credentials: 'include',
			signal: this.controller.signal,
			body: body
		})
			.then(response => response.text())
			.then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
			.then(data => data.documentElement.querySelectorAll('CHaDDataPoint'))
			.then(dataPoints => this.createDataPoints(dataPoints))
			.then(() => this.createMarker())
			.then(() => this.createPopup())
			.then(() => this.markerClickHandler())
			.then(() => this.setState({ loading: false }))
			.catch(function (error) {
				console.error(error);
			});
	}

	removePopupContainers() {
		document.querySelectorAll('.fpm-popup-container').forEach((container) => {
			container.remove();
		})
	}

	createDataPoints(dataPoints) {
		dataPoints.forEach((dataPoint) => {
			let ptNumber = dataPoint.querySelector('PtNumber').innerHTML.toString();

			dataPoint.childNodes.forEach((node) => {
				let key = node.tagName;
				let value = node.innerHTML;

				if (key && value) {

					this.setState({
						points: {
							...this.state.points,
							[ptNumber]: {
								...this.state.points[ptNumber],
								[key.toLowerCase()]: value
							}
						}
					});

				}

			});
			
		})
	}

	createMarker() {
		let coordinates = getCoordinates(this.props.instance.name.split(" ")[0].toUpperCase());
		let coordinateOffsetX = parseFloat((Math.random() * (0.000100 + 0.000100) - 0.000100));
		let coordinateOffsetY = parseFloat((Math.random() * (0.000100 + 0.000100) - 0.000100));
		let coordinateX = parseFloat(coordinates[0]) + coordinateOffsetX;
		let coordinateY = parseFloat(coordinates[1]) + coordinateOffsetY;
		coordinates = [coordinateX, coordinateY];

		let path = this.props.instance.path.split("!")[2].toLowerCase().split(" ").join("-");
		let el = document.createElement('div');
		el.classList.add(`marker-${path}`);
		el.classList.add('fpm-marker');

		let marker = new mapboxgl.Marker(el)
			.setLngLat(coordinates)
			.addTo(this.context);
		
		this.setState({ marker: marker })
	}

	createPopup() {
		var popupContainer = document.createElement('div');
		popupContainer.classList.add('fpm-popup-container');

		var popup = document.createElement('div');
		popup.classList.add('fpm-popup')
		document.body.append(popupContainer);
		popupContainer.append(popup);

		var popupTitle = document.createElement('h1');
		popupTitle.innerHTML = this.props.instance.name + " - " + this.props.instance.path.split("!")[2];
		popup.append(popupTitle);

		var closeButton = document.createElement('button');
		closeButton.classList.add('fpm-popup-close-button');
		closeButton.innerHTML = "x";
		var that = this;
		closeButton.addEventListener('click', function () {
			that.state.popupContainer.classList.remove("open-popup");
		})
		popup.append(closeButton);

		if (Object.keys(that.state.points).length <= 0) {
			let noPointsMsg = document.createElement('p');
			noPointsMsg.innerHTML = "There are no points data to display for this node.";
			popup.append(noPointsMsg);
		}
		
		this.setState({ popupContainer: popupContainer });
		this.setState({ popup: popup });
	}

	markerClickHandler() {
		var that = this;
		this.state.marker._element.addEventListener('click', function () {
			that.state.popupContainer.classList.add("open-popup");
		})
	}


	render() {
		if(this.state.loading) return null;
		
		return Object.values(this.state.points).map((point) => {
			return <Point key={`point-${point.ptnumber}`} point={point} popup={this.state.popup} />;
		})
	}

};
CHaDInstance.contextType = MapContext;

export default CHaDInstance;