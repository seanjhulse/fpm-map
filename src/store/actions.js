export const LOAD_MAP = 'LOAD_MAP';
export const loadMap = map => ({
  type: LOAD_MAP,
  map
});

export const UPDATE_COORDINATES = 'UPDATE_COORDINATES';
export const updateCoordinates = coordinates => ({
  type: UPDATE_COORDINATES,
  coordinates
});

export const UPDATE_BUILDING_ID = 'UPDATE_BUILDING_ID';
export const updateBuildingId = building_id => ({
  type: UPDATE_BUILDING_ID,
  building_id
});

export const UPDATE_BUILDING = 'UPDATE_BUILDING';
export const updateBuilding = building => ({
  type: UPDATE_BUILDING,
  building
});

export const UPDATE_SERVICES = 'UPDATE_SERVICES';
export const updateServices = services => ({
  type: UPDATE_SERVICES,
  services
});

export const UPDATE_SUBSERVICES = 'UPDATE_SUBSERVICES';
export const updateSubservices = subservices => ({
  type: UPDATE_SUBSERVICES,
  subservices
});

export const UPDATE_SIDEBAR = 'UPDATE_SIDEBAR';
export const updateSidebar = sidebar_content => ({
  type: UPDATE_SIDEBAR,
  sidebar_content
});