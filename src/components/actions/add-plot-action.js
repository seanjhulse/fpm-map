import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Modal, Button } from 'react-bootstrap';
import ServicesAPI from '../../api/services';
import { update, updateLayers } from '../../store/actions';

class AddPlotAction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.createNewPlot = this.createNewPlot.bind(this);
    this.addToPlot = this.addToPlot.bind(this);
    this.updateStartTime = this.updateStartTime.bind(this);
    this.updateEndTime = this.updateEndTime.bind(this);
  }

  toggleModal() {
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  closeModal() {
    this.setState({
      modalVisible: false,
    });
  }

  createNewPlot() {
    const { service } = this.props;
    const pointId = service.pointid;
    const { startTime, endTime } = this.state;
    // we are overwriting our plot with a new one
    ServicesAPI.get_history(pointId, startTime, endTime)
      .then((data) => {
        this.props.update('plots', {
          [service.extendedid]: {
            data,
            name: service.attributename,
          },
        });
      });

    this.closeModal();
  }

  addToPlot() {
    const { service } = this.props;
    const pointId = service.pointid;
    const { startTime, endTime } = this.state;
    // we are adding more data to our plot
    ServicesAPI.get_history(pointId, startTime, endTime)
      .then((data) => {
        this.props.update('plots', {
          ...this.props.plots,
          [service.extendedid]: {
            data,
            name: service.attributename,
          },
        });
      });

    this.closeModal();
  }

  updateStartTime(event) {
    this.setState({ startTime: event.target.value });
  }

  updateEndTime(event) {
    this.setState({ endTime: event.target.value });
  }


  render() {
    const { modalVisible } = this.state;
    let { startTime, endTime } = this.state;

    const start = new Date();
    const end = new Date();
    end.setMinutes(start.getMinutes() + 30);
    if (!startTime) {
      startTime = `${start.getHours()}:${(start.getMinutes() < 10 ? '0' : '') + start.getMinutes()}`;
    }
    if (!endTime) {
      endTime = `${end.getHours()}:${(end.getMinutes() < 10 ? '0' : '') + end.getMinutes()}`;
    }

    return (
      <td className="plot-action-container">
        <i className="material-icons" onClick={this.toggleModal}>timeline</i>
        <Modal show={modalVisible} onHide={this.toggleModal}>
          <Modal.Header closeButton>
            <Modal.Title>Plot Data?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input onChange={this.updateStartTime} type="time" id="startTime" name="startTime" value={startTime} required></input>
            <input onChange={this.updateEndTime} type="time" id="endTime" name="endTime" value={endTime} required></input>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              onClick={this.createNewPlot}
            >
              Create new plot
              </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={this.addToPlot}
            >
              Add to current plot
              </Button>
          </Modal.Footer>
        </Modal>
      </td>
    );
  }
}

AddPlotAction.propTypes = {
  update: PropTypes.func,
  updateLayers: PropTypes.func,
  map: PropTypes.object,
  service: PropTypes.object,
  subservices: PropTypes.array,
  plots: PropTypes.object,
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
  plots: state.plots,
  layers: state.layers,
  loading: state.loading,
  number_of_layers: state.number_of_layers,
});

export default connect(mapStateToProps, mapDispatchToProps)(AddPlotAction);
