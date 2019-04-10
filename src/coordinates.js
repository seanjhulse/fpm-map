const COORDINATES = {
	"AFCH": [-89.4333812, 43.0769635],
	"WARF": [-89.426053, 43.0762269]
}
let getCoordinates = function(buildingName) {
	return COORDINATES[buildingName];
}

export default getCoordinates;