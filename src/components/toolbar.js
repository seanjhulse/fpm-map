import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Accordion, Card, Form } from 'react-bootstrap';
import ServicesAPI from '../api/services';
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
        'LPS',
      ],
    };

    this.loadService = this.loadService.bind(this);
    this.unloadService = this.unloadService.bind(this);
    // this.layerExists = this.layerExists.bind(this);
  }

  componentDidMount() {
    this.state.services.map((service) => {
      ServicesAPI.get_all_attributes(service)
        .then((subservices) => {
          this.setState({ [service]: subservices });
        });
    });
  }

  loadService(layerKey, serviceKey) {
    this.props.update('loading', true);
    ServicesAPI.get_all_services(serviceKey)
      .then((subservices) => {
        this.props.updateLayers(`${layerKey}-${serviceKey}`, subservices);
      });
  }

  unloadService(layerKey, serviceKey) {
    this.props.updateLayers(`${layerKey}-${serviceKey}`, undefined);
  }

  render() {
    let eventKey = 0;
    return (
      <div className="toolbar">
        <h2 className="toolbar-label">All UW Services</h2>
        <Accordion>
          {Object.values(this.state.services).map((service) => {
            if (!this.state[service]) return null;
            eventKey += 1;
            return (
              <Card key={service}>
                <Accordion.Toggle as={Card.Header} variant="link" eventKey={eventKey}>
                  {service}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={eventKey}>
                  <Card.Body>
                    <ul className="toolbar-subservices-list">
                      {Object.values(this.state[service]).map((subservice) => (
                          <Form.Check onChange={(e) => {
                            if (e.target.checked) {
                              this.loadService(service, subservice.name);
                            } else {
                              this.unloadService(service, subservice.name);
                            }
                          }}
                            key={service + subservice.name}
                            className="toolbar-subservice"
                            label={subservice.name}
                            disabled={this.props.loading}
                            id={`inline-${subservice.name}`} />
                      ))}
                    </ul>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            );
          })}
        </Accordion>
      </div>
    );
  }
}

Toolbar.propTypes = {
  update: PropTypes.func,
  updateLayers: PropTypes.func,
  layers: PropTypes.object,
  map: PropTypes.object,
  loading: PropTypes.bool,
};

const mapDispatchToProps = (dispatch) => ({
  update: (key, value) => dispatch(update(key, value)),
  updateLayers: (key, value) => dispatch(updateLayers(key, value)),
});

const mapStateToProps = (state) => ({
  map: state.map,
  layers: state.layers,
  loading: state.loading,
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
