import layers from './layers.json';

/**
 * Toggle map layer
 * @param {Object} map          map object
 * @param {GeoJSON} features    GeoJSON features (formatted)
 * @param {String} type         Type of layer
 * @param {String} layer        Name of layer
 */
const toggleLayer = function (map, features, type = undefined, layer) {
  const mapSource = map.getSource(layer);
  if (typeof mapSource !== 'undefined') {
    // Remove map layer & source.
    removeLayer(map, layer);
    return;
  }
  addLayer(map, features, type, layer);
};


/**
 * Adds a new layer to the map
 * @param {Object} map          map object
 * @param {GeoJSON} features    GeoJSON features (formatted)
 * @param {String} type         Type of layer
 * @param {String} layer        Name of layer
 */
const addLayer = function (map, features, type = undefined, layer) {
  switch (type.toLowerCase().trim()) {
    case 'circles':
      addCircles(map, features, layer);
      break;
    case 'heatmap':
      addHeatMap(map, features, layer);
      break;
    case 'extruded dots':
      addExtrudedDots(map, features, layer);
      break;
    default:
      addDots(map, features, layer);
      break;
  }
};

/**
 * Removes a layer from the map
 */
const removeLayer = function (map, layer) {
  let count = 0;
  let mapLayer = map.getLayer(`${layer}-layer-${count}`);
  while (mapLayer) {
    map.removeLayer(`${layer}-layer-${count}`);
    count = count + 1;
    mapLayer = map.getLayer(`${layer}-layer-${count}`);
  }
  map.removeSource(layer);
};

/**
 * Adds a popup to the map
 * @param {Object} map          map object
 * @param {Array} coordinates   origin of popup
 * @param {String} html         content in popup
 */
const addPopup = function (map, coordinates, html) {
  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(
      `<div>
					${html}
				</div>`
    )
    .addTo(map);
}


const addCircles = function (map, features, layer) {
  map.addSource(`${layer}`, {
    'type': 'geojson',
    'data': {
      "type": "FeatureCollection",
      "features": features
    }
  });

  map.addLayer({
    "id": `${layer}-layer-0`,
    "source": `${layer}`,
    ...layers.circles
  });

  map.addLayer({
    "id": `${layer}-layer-1`,
    "source": `${layer}`,
    ...layers.labels
  });
}

const addDots = function (map, features, layer) {
  map.addSource(`${layer}`, {
    'type': 'geojson',
    'data': {
      "type": "FeatureCollection",
      "features": features
    }
  });

  map.addLayer({
    "id": `${layer}-layer-0`,
    "source": `${layer}`,
    ...layers.dots
  });

  map.addLayer({
    "id": `${layer}-layer-1`,
    "source": `${layer}`,
    ...layers.labels
  });
}

const addExtrudedDots = function (map, features, layer) {
  // generate polygons around point
  let polygons = features.map(tempFeature => {
    let feature = {
      type: "Feature",
      properties: tempFeature.properties
    };

    let coordinates = tempFeature.geometry.coordinates;
    let offset = 0.0001;
    let n = offset * Math.sqrt(2) / 2;
    let topLeft = [coordinates[0] + n, coordinates[1] + n];
    let topRight = [coordinates[0] + n, coordinates[1] - n];
    let botLeft = [coordinates[0] - n, coordinates[1] + n];
    let botRight = [coordinates[0] - n, coordinates[1] - n];

    feature = {
      ...feature,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            topLeft,
            topRight,
            botRight,
            botLeft,
            topLeft
          ]
        ]
      }
    };

    return feature;
  })

  map.addSource(`${layer}`, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: polygons,
    }
  });

  map.addLayer({
    id: `${layer}-layer-0`,
    source: `${layer}`,
    ...layers.extrusion
  });
}

const addHeatMap = function (map, features, layer) {
  map.addSource(`${layer}`, {
    'type': 'geojson',
    'data': {
      "type": "FeatureCollection",
      "features": features
    }
  });

  map.addLayer({
    "id": `${layer}-layer-0`,
    "source": `${layer}`,
    ...layers.heatmap
  });

  map.addLayer({
    "id": `${layer}-layer-1`,
    "source": `${layer}`,
    ...layers.labels,
  });
}


export default {
  toggleLayer,
  addPopup
}