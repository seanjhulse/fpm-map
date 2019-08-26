import {
  LOAD_MAP,
  UPDATE,
} from './actions';

const reducers = (state = {
  map: null,
  buildings: null,
  coordinates: null,
  services: {},
  subservices: {},
  colors: [
    '#bd0000',
    '#8f398f',
    '#00628c'
  ],
  current_color: 0,
  layers: {},
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
    case UPDATE:
      return {
        ...state,
        [action.key]: action.value
      }
    default:
      return state
  }
}

export default reducers