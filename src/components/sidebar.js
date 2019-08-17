import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateSubservices } from '../store/actions';
import ServicesAPI from '../api/services';

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    }

    this.services = this.services.bind(this);
    this.subservices = this.subservices.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  services() {
    if (Object.keys(this.props.services).length) {
      const services = this.props.services.map(service => {
        return (
          <li key={service.instanceid}>
            <p onClick={() => this.subservices(service)}>{service.name}</p>
          </li>
        )
      });
      
      return services;
    } else {
      return null;
    }
  }

  subservices(service) {
    ServicesAPI.get_service_by_building(service, (subservices) => {
      this.props.updateSubservices(subservices);
    });
  }

  toggleSidebar() {
    this.setState({ open: !this.state.open });
  }

  render() {
    return (
      <div className="sidebar" data-state-open={this.state.open}>
        <div className="sidebar-content">
          {this.props.sidebar_content}
        </div>
        <div className="services">
          <ul>
            {this.services()}
          </ul>
        </div>
        <div className="sidebar-tab" onClick={this.toggleSidebar}></div>
      </div>
    )
  }
};

const mapDispatchToProps = dispatch => {
  return {
    updateSubservices: subservices => dispatch(updateSubservices(subservices)),
  }
}

const mapStateToProps = state => {
  return {
    sidebar_content: state.sidebar_content,
    services: state.services
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);