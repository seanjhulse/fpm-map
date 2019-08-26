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

export default {
	convertToJSON
};