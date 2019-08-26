import React, { Component } from 'react';
import { connect } from 'react-redux';
import ServicesAPI from '../api/services';
import BuildingsAPI from '../api/building';
import { update, updateLayers } from '../store/actions';

class Toolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      services: [
        'Chilled Water',
        'Compressed Air',
        'Condensate',
        'Electric',
        'HPS',
        'LPS'
      ],
    }

    this.loadService = this.loadService.bind(this);
  }

  componentDidMount() {
    this.state.services.map(service => {
      ServicesAPI.get_all_attributes(service)
        .then(subservices => {
          this.setState({ [service]: subservices });
        });
    });
  }

  loadService(service_name, service_id) {
    this.props.update('layer', service_id);
    ServicesAPI.get_all_services(service_name)
      .then(subservices => this.props.update('subservices', subservices))
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
                      <li onClick={() => this.loadService(subservice.name, `${service}-${subservice.name}`)} key={subservice.name}>{subservice.name}</li>
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

const mapDispatchToProps = dispatch => {
  return {
    update: (key, value) => dispatch(update(key, value)),
    updateLayers: (key, value) => dispatch(updateLayers(key, value)),
  }
}

const mapStateToProps = state => {
  return {
    map: state.map,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
