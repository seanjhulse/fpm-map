import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AddPlotAction from '../actions/add-plot-action';

class ServiceLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      value: 0,
      updated: {},
    };
  }

  componentDidMount() {
    let value = 0;
    const data = {};
    this.props.service.map((service) => {
      value += service.curval;
      data[service.attributename] = service.curval;
    });

    this.setState({ data, value });
  }

  componentDidUpdate() {
    let value = 0;
    const data = {};
    const updated = {};
    this.props.service.map((service) => {
      value += service.curval;
      data[service.attributename] = service.curval;
      if (service.curval !== this.state.data[service.attributename]) {
        updated[service.attributename] = true;
      }
    });

    // value has been updated
    if (value !== this.state.value) {
      this.setState({ data, value, updated });
      // reset updated styling
      setTimeout(() => {
        this.setState({ updated: {} });
      }, 2000);
    }
  }

  render() {
    const { service } = this.props;
    if (!service || service.length <= 0) {
      return null;
    }
    return (
      <tbody>
        {service.map((data) => (
          <tr key={data.instanceid + data.attributename} className={this.state.updated[data.attributename] ? 'updated service-table-row' : 'service-table-row'}>
            <td className="service-table-data">{data.attributename}</td>
            <td className="service-table-data">{data.curval} <span className="service-units">{data.units}</span></td>
            <AddPlotAction service={data} />
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
