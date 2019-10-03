import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import BuildingAPI from '../../api/building';
import ServicesAPI from '../../api/services';
import ServicesLayer from './services-layer';

class BuildingLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      building_number: undefined,
      interval: undefined,
    };

    this.load = this.load.bind(this);
  }

  componentDidUpdate() {
    if (this.props.building.building_number !== this.state.building_number) {
      this.setState({ building_number: this.props.building.building_number, loading: true });
      if (this.state.interval) {
        // eslint-disable-next-line no-undef
        window.clearInterval(this.state.interval);
      }
      this.load();
      const interval = setInterval(() => {
        this.load();
      }, 10000);
      this.setState({ interval });
    }
  }

  load() {
    BuildingAPI.get_building_services(this.props.building.building_number)
      .then((services) => Promise.all(
        services.map((service) => ServicesAPI.get_service_by_building(service)),
      ))
      .then((services) => this.setState({ services, loading: false }));
  }

  render() {
    const { building } = this.props;
    if (!building) {
      return <p className='toolbar-empty-message'>No building selected. Click on a building to see its information and service.</p>;
    }
    if (this.state.loading) {
      return (
        <div className="building-layer">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading</span>
          </Spinner>
        </div>
      );
    }
    return (
      <div className="building-layer">
        <img src={building.thumbnail} />
        <div className="building-details">
          <h3 className="building-name">{building.name}</h3>
          <p>{building.street_address}</p>
        </div>
        <ServicesLayer services={this.state.services} />
      </div>
    );
  }
}

BuildingLayer.propTypes = {
  building: PropTypes.object,
};

const mapStateToProps = (state) => ({
  building: state.building,
});

export default connect(mapStateToProps)(BuildingLayer);
