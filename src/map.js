import React from 'react';
import PropTypes from 'prop-types';

// import components
import { connect } from 'react-redux';
import Layers from './components/layers';
import Building from './components/building';
import Toolbar from './components/toolbar';
import Loading from './components/loading';
import Message from './components/message';

// import redux
import { loadMap, update } from './store/actions';

// import api
import UserAPI from './api/user';

// import data
import buildings from '../data/real/buildings.json';
import geojson from '../data/real/geojson.json';

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      buildings,
    };

    this.initMapFeatures = this.initMapFeatures.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
  }

  /**
   * Initialize the app with a map instance
   */
  componentDidMount() {
    // login
    UserAPI.login();

    mapboxgl.accessToken = 'pk.eyJ1IjoidXdtYWRpc29uLXVjb21tIiwiYSI6InlSb2xNMmcifQ.QdGExUkysAJkvrS6B4U2WA';
    mapboxgl.workerCount = 6;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: [-89.396127, 43.071299],
      zoom: 12,
      hash: true,
    });
    this.props.loadMap(map);

    // add map functions
    map.on('mousemove', this.hoverHandler);
    map.on('click', this.clickHandler);

    // load other features once map has loaded
    map.on('load', this.initMapFeatures);
  }

  componentWillUnmount() {
    this.props.map.remove();
  }

  initMapFeatures() {
    // add the building to the actual map
    this.props.map.addSource('fpm-buildings', {
      type: 'geojson',
      data: geojson,
      tolerance: 2,
    });
    this.props.map.addLayer({
      id: 'fpm-buildings-layer',
      type: 'fill',
      source: 'fpm-buildings',
      paint: {
        'fill-color': '#000',
        'fill-opacity': 0.15,
      },
    });
    this.props.map.addSource('dane-country-regional-airport', {
      type: 'image',
      url: 'ParkingMap.png',
      coordinates: [
        [-89.350331325, 43.139526080],
        [-89.34316356461, 43.13931344052],
        [-89.3435008941, 43.1280687150],
        [-89.3506683081, 43.1280797150],
      ],
    });
    this.props.map.addLayer({
      id: 'overlay',
      source: 'dane-country-regional-airport',
      type: 'raster',
      paint: {
        'raster-opacity': 0.75,
      },
    });
    this.setState({ loading: false });
  }

  clickHandler(e) {
    const bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
    const features = this.props.map.queryRenderedFeatures(bbox);
    const nearestFeature = features.filter((feature) => feature.layer.source === 'fpm-buildings')[0];
    if (nearestFeature && nearestFeature.properties.id) {
      this.props.update('building', this.state.buildings[nearestFeature.properties.id]);
      this.props.update('building_id', nearestFeature.properties.id);
      this.props.update('coordinates', e.lngLat);
    }
  }

  hoverHandler(e) {
    const bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
    const features = this.props.map.queryRenderedFeatures(bbox);
    const nearestFeature = features.filter((feature) => {
      return feature.properties && feature.properties.key;
    })[0];
    if (nearestFeature && nearestFeature.properties.key) {
      if (this.state.hoverPopup) this.state.hoverPopup.remove();
      // this.createHoverPopup(e.lngLat, features);
    }
  }

  render() {
    if (!this.state.loading) {
      return (
        <div>
          <div id="map"></div>
          {/* <Toolbar updateLayers={this.updateLayers} /> */}
          <Layers />
          <Building />
          <Toolbar />
          <Loading />
          <Message />
        </div>
      );
    }
    return (
        <div>
          <div id="map"></div>
          <img id="loader" src="loader.gif" />
        </div>
    );
  }
}

Map.propTypes = {
  map: PropTypes.object,
  queryRenderedFeatures: PropTypes.func,
  update: PropTypes.func,
  loadMap: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
  loadMap: (map) => dispatch(loadMap(map)),
  update: (key, value) => dispatch(update(key, value)),
});

const mapStateToProps = (state) => ({
  map: state.map,
  services: state.services,
  building_id: state.building_id,
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);
