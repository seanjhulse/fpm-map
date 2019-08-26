export const LOAD_MAP = 'LOAD_MAP';
export const loadMap = map => ({
  type: LOAD_MAP,
  map
});

export const UPDATE = 'UPDATE';
export const update = (key, value) => ({
  type: UPDATE,
  key,
  value
});

export const UPDATE_LAYERS = 'UPDATE_LAYERS';
export const updateLayers = (key, value) => ({
  type: UPDATE_LAYERS,
  key,
  value
});