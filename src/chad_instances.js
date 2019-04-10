import React, { Component } from 'react';
import CHaDInstance from './chad_instance';

/**
 * CHaD instances represent a collection of eDNA points (which are really just
 * CHaD instances) at a single building with a single type. All CHaD instances
 * have a parent type of !metering-monitoring!
 * @param instanceId the ID of the instance
 * @param type the type of meter (eg. chilled water, compressed air, electrical, etc.)
 * @param name the BUILDING name, which loosely associates these CHaD instances with a location
 * @param parentId the ID of the parent CHaD class
 */
class CHaDInstances extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			instances: {}
		}

		this.createInstances = this.createInstances.bind(this);
		this.findCHaDInstances = this.findCHaDInstances.bind(this);
	}

	componentDidMount() {
		this.findCHaDInstances();
	}

	/**
	 * makes POST request to a SOAP endpoint which grabs all CHaD instances via
	 * the passed in building name
	 */
	findCHaDInstances() {
		let url = "http://ednaweb.fpm.wisc.edu/webservice/CHaD.asmx";
		let headers = new Headers();
		headers.append('Content-Type', 'text/xml');
		headers.append('Authorization', 'Basic ' + window.btoa("TODO: ADD AUTHORIZATION HEADER"));
		headers.append('SOAPAction', 'http://instepsoftware.com/webservices/FindCHaDInstances');

		let body =
			`<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<FindCHaDInstances xmlns="http://instepsoftware.com/webservices">
						<InstancePath>*</InstancePath>
						<InstanceName>*${this.props.name}*</InstanceName>
						<ClassName>*</ClassName>
					</FindCHaDInstances>
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
			.then(data => data.documentElement.querySelectorAll('CHaDInstance'))
			.then(CHaDInstances => this.createInstances(CHaDInstances))
			.then(() => this.setState({ loading: false }))
			.catch(function (error) {
				console.error(error);
			});
	}

	/**
	 * rehydrates the state with the fetched data by iterating over the XML
	 * @param {xml from request} CHaDInstances
	 */
	createInstances(CHaDInstances) {
		CHaDInstances.forEach((CHaDInstance) => {
			let instanceId = CHaDInstance.querySelector('InstanceID').innerHTML.toString();
			Array.from(CHaDInstance.children).forEach((CHaDInstanceItem) => {
				let key = CHaDInstanceItem.tagName.toLowerCase();
				let val = CHaDInstanceItem.innerHTML.toString();

				this.setState({
					instances: {
						...this.state.instances,
						[instanceId]: {
							...this.state.instances[instanceId],
							[key]: val
						}
					}
				});

			});
		})
	}

	render() {
		if (this.state.loading) return null;
		return Object.values(this.state.instances).map((instance) => {
			return <CHaDInstance key={`instance-${instance.instanceid}`} instance={instance} />
		});
	}

};

export default CHaDInstances;