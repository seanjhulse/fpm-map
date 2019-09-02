import React, { Component } from 'react';
import { connect } from 'react-redux';
import ServicesAPI from '../api/services';
import { Accordion, Card, Form } from 'react-bootstrap';
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

  loadService(subservice, layerKey, serviceKey) {
    ServicesAPI.get_all_services(subservice)
      .then(subservices => {
        this.props.updateLayers(layerKey, serviceKey, {
          active: true,
          data: subservices,
        });
      });
  }

  render() {
    let eventKey = 0;
    return (
      <div className="toolbar">
        <h2 className="toolbar-label">All UW Services</h2>
        <Accordion>
          {Object.values(this.state.services).map(service => {
            if (!this.state[service]) return null;
            eventKey = eventKey + 1;
            return (
              <Card key={service}>
                <Accordion.Toggle as={Card.Header} variant="link" eventKey={eventKey}>
                  {service}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={eventKey}>
                  <Card.Body>
                    <ul className="toolbar-subservices-list">
                      {Object.values(this.state[service]).map(subservice => {
                        return (
                          <Form.Check onClick={() => this.loadService(subservice.name, service, subservice.name)}
                            key={service + subservice.name}
                            className="toolbar-subservice"
                            label={subservice.name}
                            id={`inline-${subservice.name}`} />
                        )
                      })}
                    </ul>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            )
          })}
        </Accordion>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    update: (key, value) => dispatch(update(key, value)),
    updateLayers: (layerKey, serviceKey, value) => dispatch(updateLayers(layerKey, serviceKey, value)),
  }
}

const mapStateToProps = state => {
  return {
    map: state.map,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
