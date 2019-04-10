import React, { Component } from 'react';

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

		this.fetchPoint = this.fetchPoint.bind(this);
		this.createPoint = this.createPoint.bind(this);
		this.addToPopup = this.addToPopup.bind(this);
	}

	componentDidMount() {
		this.fetchPoint();
	}
	
	fetchPoint() {
		let url = "http://ednaweb.fpm.wisc.edu/webservice/Service.asmx";
		let headers = new Headers();
		headers.append('Content-Type', 'text/xml');
		headers.append('Authorization', 'Basic ' + window.btoa("TODO: ADD AUTHORIZATION HEADER"));
		headers.append('SOAPAction', 'http://instepsoftware.com/webservices/GetCurrentValues');
		let body =
		`<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<GetCurrentValues xmlns="http://instepsoftware.com/webservices">
						<PointIDs>${this.props.point.ptcode}</PointIDs>
					</GetCurrentValues>
				</soap:Body>
			</soap:Envelope>`;
		
		fetch(url, {
			headers: headers,
			method: 'POST',
			credentials: 'include',
			body: body
		})
			.then(response => response.text())
			.then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
			.then(data => data.documentElement.querySelector('Point'))
			.then(dataPoint => this.createPoint(dataPoint))
			.then(() => this.addToPopup())
			.then(() => this.setState({ loading: false }))
	}

	createPoint(dataPoint) {
		Array.from(dataPoint.children).forEach((point) => {
			this.setState({
				...this.state,
				[point.tagName.toLowerCase()]: point.innerHTML.toString()
			})
		})
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

	render() {
		if (this.state.loading) return null;
		return null;
	}
}

export default Point;