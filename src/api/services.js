import service_points from '../data/ideal/services_points.json';
import pts from '../data/ideal/points.json';
import Helpers from './helpers';

const get = function (type=undefined, subtype=undefined) {
	if (!type) {
		console.error("Type must be specified");
		return;
	}
	if (!subtype) return service_points[type];

	let results = [];
	service_points[type].map(point => {
		if (point.ExtendedDescription.indexOf(subtype) !== -1) {
			results.push(pts[point.ExtendedID]);
		}
	});

	return new Promise(function (resolve, reject) {
		resolve(Helpers.geocode(results))
	})
}

export default {
	get
}