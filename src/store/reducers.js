import {
  LOAD_MAP,
  UPDATE,
  UPDATE_LAYERS,
} from './actions';

const reducers = (state = {
  map: null,
  buildings: null,
  coordinates: null,
  services: {},
  subservices: [],
  colors: [
    'rgba(189,0,0,1)',
    'rgba(143,57,143,1)',
    'rgba(0,98,140,1)',
  ],
  current_color: 0,
  number_of_layers: 0,
  features: [],
  type: '',
  message: '',
  messageType: '',
  layers: {},
  remove_layer: false,
  add_layer: false,
  loading: false,
  building: null,
  building_id: null,
  sidebar_content: null,
}, action) => {
  switch (action.type) {
    case LOAD_MAP:
      return {
        ...state,
        map: action.map,
      };
    case UPDATE:
      return {
        ...state,
        [action.key]: action.value,
      };
    case UPDATE_LAYERS:
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.key]: action.value,
        },
      };
    default:
      return state;
  }
};

export default reducers;
