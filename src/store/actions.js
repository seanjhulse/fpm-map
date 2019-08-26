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