import buildings from '../data/real/buildings.json';

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

const geocode = function (features) {
	features = features.filter(feat => feat.buildingID && buildings[feat.buildingID])

	let results = features.map(feat => {
	
		let feature = {
			type: "Feature",
			properties: feat
		};

		feature = {
			...feature,
			properties: {
				...feature.properties,
				Value: parseFloat(feature.properties.Value)
			}
		}
		
		let coordinates = buildings[feat.buildingID].latlng;
	
		feature = {
			...feature,
			geometry: {
				type: "Point",
				coordinates: coordinates.reverse()
			}
		};

		return feature;
	
	});

	return results;
}

export default {
	convertToJSON,
	geocode
};