import {
  LOAD_MAP,
  UPDATE_BUILDING,
  UPDATE_BUILDING_ID,
  UPDATE_SERVICES,
  UPDATE_SIDEBAR,
  UPDATE_COORDINATES,
  UPDATE_SUBSERVICES,
} from './actions';

const reducers = (state = {
  map: null,
  buildings: null,
  coordinates: null,
  services: {},
  subservices: {},
  building: null,
  building_id: null,
  sidebar_content: null
}, action) => {
  switch (action.type) {
    case LOAD_MAP:
      return {
        ...state,
        map: action.map
      }
    case UPDATE_COORDINATES:
      return {
        ...state,
        coordinates: action.coordinates
      }
    case UPDATE_BUILDING:
      return {
        ...state,
        building: action.building
      }
    case UPDATE_BUILDING_ID:
      return {
        ...state,
        building_id: action.building_id
      }
    case UPDATE_SERVICES:
      return {
        ...state,
        services: action.services
      }
    case UPDATE_SUBSERVICES:
      return {
        ...state,
        subservices: action.subservices
      }
    case UPDATE_SIDEBAR:
      return {
        ...state,
        sidebar_content: action.sidebar_content
      }
    default:
      return state
  }
}

export default reducers