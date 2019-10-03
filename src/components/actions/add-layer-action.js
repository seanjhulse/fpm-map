import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Modal, Button } from 'react-bootstrap';
import ServicesAPI from '../../api/services';
import { update, updateLayers } from '../../store/actions';

class AddLayerAction extends Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      validated: false,
      intervals: {},
      services: [
        'Chilled Water',
        'Compressed Air',
        'Condensate',
        'Electric',
        'HPS',
        'LPS',
      ],
      subservices: [],
      layerTypes: [
        'circles',
        'dots',
        'heatmap',
        'extruded dots',
      ],
    };

    this.addLayer = this.addLayer.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.serviceSelected = this.serviceSelected.bind(this);
    this.subserviceSelected = this.subserviceSelected.bind(this);
    this.layerTypeSelected = this.layerTypeSelected.bind(this);
    this.load = this.load.bind(this);
  }

  toggleModal() {
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  closeModal() {
    this.setState({
      modalVisible: false,
      service: undefined,
      subservice: undefined,
      layerType: undefined,
      subservices: [],
    });
  }

  serviceSelected(event) {
    if (!event.target.value) {
      this.setState({ subservices: [], service: undefined });
      return;
    }
    const { map } = this.props;
    const service = event.target.value;
    ServicesAPI.get_all_attributes(service)
      .then((subservices) => {
        // remove subservices that have been added already
        const filteredSubservices = subservices.filter((subservice) => !map.getSource(`${service}-${subservice.name}`));
        this.setState({
          service,
          subservices: filteredSubservices,
          subservice: filteredSubservices[0].name,
        });
      });
  }

  subserviceSelected(event) {
    if (event.target.value) {
      this.setState({ subservice: event.target.value });
    } else {
      this.setState({ subservice: undefined });
    }
  }

  layerTypeSelected(layerType) {
    this.setState({ layerType });
  }

  addLayer(event) {
    event.preventDefault();

    const { service, subservice } = this.state;

    // start loading
    this.props.update('loading', true);
    this.props.update('type', this.state.layerType);
    this.closeModal();

    if (this.state.intervals[`${service}-${subservice}`]) {
      window.clearInterval(this.state.intervals[`${service}-${subservice}`]);
    }
    this.load(service, subservice);
    const interval = setInterval(() => {
      this.load(service, subservice);
    }, 10000);
    this.setState({
      intervals: {
        ...this.state.intervals,
        [`${service}-${subservice}`]: interval,
      },
    });
  }

  load(service, subservice) {
    // grab all the values
    ServicesAPI.get_all_services(subservice)
      .then((subserviceValues) => this.props.updateLayers(`${service}-${subservice}`, subserviceValues));
  }

  render() {
    const {
      modalVisible,
      services,
      subservices,
      validated,
      layerTypes,
    } = this.state;

    const { number_of_layers } = this.props;

    return (
      <div className="buttons-toolbar-container">
        <Button className="toggle-buttons-toolbar circle-button" variant="success" onClick={this.toggleModal} disabled={number_of_layers >= 3}>
          <i className="material-icons md-18">add</i>
        </Button>
        <Modal show={modalVisible} onHide={this.toggleModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Layer</Modal.Title>
          </Modal.Header>
          <Form noValidate id="add-layer-form" validated={validated} onSubmit={this.addLayer}>
            <Modal.Body>
              <Form.Group controlId="validationLayer">
                <Form.Label>Select Layer</Form.Label>
                <Form.Control
                  as="select"
                  required
                  isValid={this.state.service}
                  onChange={this.serviceSelected}>
                  <option key="empty-service-option" value=""></option>
                  {services.map((service) => <option key={`service-${service}`}>{service}</option>)}
                </Form.Control>
                <Form.Control.Feedback>
                  Great! Now pick one of {this.state.service}&#39;s services
                  </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="validationService">
                <Form.Label>Select Service</Form.Label>
                <Form.Control
                  disabled={typeof this.state.service === 'undefined'}
                  as="select"
                  required
                  isValid={this.state.subservice}
                  onChange={this.subserviceSelected}>
                  {subservices.map((subservice) => <option key={`subservice-${subservice.name}`}>{subservice.name}</option>)}
                </Form.Control>
                <Form.Control.Feedback>Ok! Now choose a layer type</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="validationLayerType" >
                <Form.Label>Select Layer Type</Form.Label>
                {layerTypes.map((layerType) => (
                  <Form.Check
                    key={layerType}
                    required
                    disabled={typeof this.state.subservice === 'undefined'}
                    isValid={this.state.layerType === layerType}
                    label={layerType[0].toUpperCase() + layerType.substr(1)}
                    name="layer-type-radios"
                    onClick={() => this.layerTypeSelected(layerType)}
                    type="radio" />
                ))}
                <Form.Control.Feedback>
                  You&#39;re ready to add this layer to the map!
                </Form.Control.Feedback>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.closeModal}>Cancel</Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!this.state.layerType || !this.state.subservice || !this.state.service}>
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    );
  }
}


AddLayerAction.propTypes = {
  update: PropTypes.func,
  updateLayers: PropTypes.func,
  map: PropTypes.object,
  service: PropTypes.string,
  subservices: PropTypes.array,
  loading: PropTypes.bool,
  number_of_layers: PropTypes.number,
  eventKey: PropTypes.number,
};

const mapDispatchToProps = (dispatch) => ({
  update: (key, value) => dispatch(update(key, value)),
  updateLayers: (key, value) => dispatch(updateLayers(key, value)),
});

const mapStateToProps = (state) => ({
  map: state.map,
  layers: state.layers,
  loading: state.loading,
  number_of_layers: state.number_of_layers,
});

export default connect(mapStateToProps, mapDispatchToProps)(AddLayerAction);
