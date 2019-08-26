import React, { Component } from 'react';
import { connect } from 'react-redux';
import ServicesAPI from '../api/services';
import BuildingsAPI from '../api/building';
import MapAPI from '../api/map';

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

  loadService(service_name) {
    const { map } = this.props;
    const features = [];
    ServicesAPI.get_all_services(service_name)
      .then(subservices => {
        return subservices.map(subservice => {
          return new Promise((resolve, reject) => {
            const name = subservice.instancename.split('!');
            const path = `!${name[1].trim()}!${name[2].trim()}`
            try {
              BuildingsAPI.get_building_number(path)
                .then(building_instance => {
                  const building_number = building_instance[0].attvalue;
                  try {
                    const building = BuildingsAPI.get_building(building_number);
                    const feature = {
                      "type": "Feature",
                      "geometry": {
                        "type": "Point",
                        "coordinates": building.latlng.reverse(),
                      },
                      "properties": {
                        "Value": Number(subservice.curval),
                        "Description": `${building.name}: ${subservice.curval} ${subservice.units}`
                      }
                    };
                    features.push(feature);
                    resolve(feature);
                  } catch (error) {
                    resolve({})
                  }
                });
            } catch (error) {
              reject({ error: 'Failed to find building instance with path ' + path });
            }
          });
        });
      })
      .then(promises => Promise.all(promises))
      .then(() => {
        MapAPI.toggleLayer(map, features, 'heatmap', service_name);
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
