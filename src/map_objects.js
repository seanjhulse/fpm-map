const MAP_OBJECTS = {
	"1426": "AFCH",
	"0039": "WARF",
	"1243": "OGG"
}
let getMapObject = function (buildingId) {
	return MAP_OBJECTS[buildingId];
}

export default getMapObject;