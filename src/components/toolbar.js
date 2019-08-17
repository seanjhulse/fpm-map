import React, { Component } from 'react';
import { connect } from 'react-redux';
import ServicesAPI from '../api/services';

class Toolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      services: [
        'Chilled Water'
      ],
    }

    this.loadService = this.loadService.bind(this);
  }

  componentDidMount() {
    this.state.services.map(service => {
      ServicesAPI.get_all_attributes(service, (subservices) => {
        this.setState({ [service]: subservices });
      });
    });
  }

  loadService(service_name) {
    const { map } = this.props;
    ServicesAPI.get_all_services(service_name, (subservices) => {
      
    });
  }

  render() {
    return (
      <div className="toolbar">
        <ul className="toolbar-services-list">
          {Object.values(this.state.services).map(service => {
            if (!this.state[service]) return null;

            return (
              <li key={service}>
                {service}
                <ul>
                  {Object.values(this.state[service]).map(subservice => {
                    return (
                      <li onClick={() => this.loadService(subservice.name)} key={subservice.name}>{subservice.name}</li>
                    )
                  })}
                </ul>
              </li>
            )

          })}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    map: state.map,
    service_data: state.service_data
  }
}

export default connect(mapStateToProps)(Toolbar);
