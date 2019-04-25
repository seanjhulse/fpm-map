const user = undefined;
const pass = undefined;
const base = "http://ednaweb.fpm.wisc.edu/webservice/";
let headers = new Headers({
	'Content-Type': 'text/xml',
	'Authorization': 'Basic ' + window.btoa("TODO: ADD AUTH")
});
import chads from './data/chads.json';
import chad_points from './data/chad_points.json';
import points from './data/points.json';

/**
 * Generically takes an array of XML nodes and creates a JSON array of it
 * @param {XMLDocument} xmlNodes 
 * @returns {JSON}
 */
const convertToJSON = function (xmlNodes) {
	let json = [];
	Array.from(xmlNodes).forEach((xmlNode) => {
		let node = {};
		Array.from(xmlNode.children).forEach((dataAttribute) => {
			node[dataAttribute.tagName.toLowerCase()] = dataAttribute.innerHTML.toString();
		});
		json.push(node);
	});
	return json;
}

/**
 * Grabs the point value for a give ptcode
 * @param {String} ptcode CHaD extended ID
 * @param {Function} callback
 */
const getCurrentValues = function (ptcode) {
	let body =
	`<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<GetCurrentValues xmlns="http://instepsoftware.com/webservices">
					<PointIDs>${ptcode}</PointIDs>
				</GetCurrentValues>
			</soap:Body>
		</soap:Envelope>`;

	return new Promise(function (resolve, reject) {
		// fetch(base + "Service.asmx", {
		// 	headers: headers,
		// 	method: 'POST',
		// 	body: body
		// })
		// 	.then(response => response.text())
		// 	.then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
		// 	.then(data => data.documentElement.querySelectorAll('Point'))
		// 	.then(xml => convertToJSON(xml))
		// 	.then(json => resolve(json[0])) // grab the first point
		// 	.catch(error => reject(error));
		resolve(points.filter(point => point.pointname === ptcode));
	})
}

/**
 * Grabs all instances of Chilled Water CHaD models
 * @param {Function} callback 
 */
const getChillers = function () {
	getCHaD("Chilled Water");
}

/**
 * Grabs all instances of CHaD models under a type
 * @param {String} type name of the type (defaults to all types)
 * @param {Function} callback 
 */
const getCHaD = function(type="") {
	let body =
	`<?xml version="1.0" encoding="utf-8"?>
	<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
		<soap:Body>
			<FindCHaDInstances xmlns="http://instepsoftware.com/webservices">
				<InstancePath>!Metering-Monitoring!${type}*</InstancePath>
				<InstanceName>*</InstanceName>
				<ClassName>*</ClassName>
			</FindCHaDInstances>
		</soap:Body>
	</soap:Envelope>`;

	return new Promise(function (resolve, reject) {
		// fetch(base + "CHaD.asmx", {
		// 	headers: headers,
		// 	method: 'POST',
		// 	body: body
		// })
		// 	.then(response => response.text())
		// 	.then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
		// 	.then(data => data.documentElement.querySelectorAll('CHaDInstance'))
		// 	.then(xml => convertToJSON(xml))
		// 	.then(json => resolve(json))
		// 	.catch(error => reject(error))
		resolve(chads.filter(chad => chad.path.indexOf(type) !== -1));
	})
}

/**
 * gets all of the data points under a single CHaD instance.
 * @param {String} instanceID
 */
const getCHaDInstanceDataPoints = function(instanceID) {
	let body =
	`<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<GetCHaDInstanceDataPoints xmlns="http://instepsoftware.com/webservices">
					<InstanceID>${instanceID}</InstanceID>
				</GetCHaDInstanceDataPoints>
			</soap:Body>
		</soap:Envelope>`;

	return new Promise(function (resolve, reject) {
		// fetch(base + "CHaD.asmx", {
		// 	headers: headers,
		// 	method: 'POST',
		// 	credentials: 'include',
		// 	body: body
		// })
		// 	.then(response => response.text())
		// 	.then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
		// 	.then(data => data.documentElement.querySelectorAll('CHaDDataPoint'))
		// 	.then(xml => convertToJSON(xml))
		// 	.then(json => resolve(json))
		// 	.catch(error => reject(error));
		resolve(chad_points[instanceID])
	})
}

const getDataPoints = function (points) {
	return new Promise(function (resolve, reject) {
		resolve(Promise.all(
			points.map(point => getCurrentValues(point.ptcode))
		))
	})
}

const getAllCHaDDataPoints = function (type = "", callback) {
	return new Promise(function (resolve, reject) {
		getCHaD(type)
			.then(CHaDs =>
				Promise.all(CHaDs.map(CHaD => getCHaDInstanceDataPoints(CHaD.instanceid)))
			)
			.then(instances => 
				Promise.all(instances.map(instance => getDataPoints(instance)))
		)
			.then(points => points.flat())
			.then(points => resolve(points.flat()))
			.catch(error => reject(error));
	});
}

export default {
	getAllCHaDDataPoints,
	getCHaD,
	getChillers,
	getCurrentValues,
};