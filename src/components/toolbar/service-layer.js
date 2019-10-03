import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class ServiceLayer extends Component {
  render() {
    const { service } = this.props;
    if (!service || service.length <= 0) {
      return null;
    }
    return (
      <tbody>
        {service.map((data) => (
          <tr key={data.instanceid + data.attributename} className="service-table-row">
            <td className="service-table-data">{data.attributename}</td>
            <td className="service-table-data">{data.curval} <span className="service-units">{data.units}</span></td>
          </tr>
        ))}
      </tbody>
    );
  }
}
  
ServiceLayer.propTypes = {
  service: PropTypes.array,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(ServiceLayer);
