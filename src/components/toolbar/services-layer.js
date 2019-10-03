import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ServiceLayer from './service-layer';

class ServicesLayer extends Component {
  render() {
    const { services } = this.props;
    if (!services) {
      return <p className='toolbar-empty-message'>No services available.</p>;
    }
    return services.map((service) => {
      if (service[0]) {
        return (
          <div key={service[0].extendedid} className="service-container">
            <p className="service-name">{service[0].classname}</p>
            <table className="service-table">
              <ServiceLayer service={service} />
            </table>
          </div>
        );
      }
    });
  }
}

ServicesLayer.propTypes = {
  services: PropTypes.array,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(ServicesLayer);
