import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form } from 'react-bootstrap';
import { updateLayers } from '../../store/actions';

class ActiveLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      types: {
        dots: 'grain',
        circles: 'bubble_chart',
        heatmap: 'blur_on',
        'extruded dots': 'bar_chart',
      },
    };

    this.toggleLayerVisibility = this.toggleLayerVisibility.bind(this);
    this.removeLayer = this.removeLayer.bind(this);
  }

  componentDidMount() {
    const { type } = this.props;
    this.setState({ type });
  }

  toggleLayerVisibility(event) {
    const { map, layerName } = this.props;
    let count = 0;
    let layer = map.getLayer(`${layerName}-layer-${count}`);

    while (layer) {
      if (event.target.checked) {
        this.props.map.setLayoutProperty(`${layerName}-layer-${count}`, 'visibility', 'visible');
      } else {
        this.props.map.setLayoutProperty(`${layerName}-layer-${count}`, 'visibility', 'none');
      }
      count += 1;
      layer = map.getLayer(`${layerName}-layer-${count}`);
    }

    this.setState({ visible: !this.state.visible });
  }

  /**
   * Removes the layer from the store which rerenders <Layers />
   * without the layer in the set
   */
  removeLayer(event) {
    event.preventDefault();
    const { layerName } = this.props;
    this.props.updateLayers(layerName, undefined);
  }

  render() {
    const { layerName } = this.props;
    return (
      <li className="active-layer" key={`toolbar-item-${layerName}`}>
        <i className="active-layer-icon material-icons md-18">{this.state.types[this.state.type]}</i>
        <p className="active-layer-name">{layerName.split('-').join(': ')}</p>
        <Form>
          <div className='custom-control custom-switch'>
            <input
              type='checkbox'
              id={`switch-for-${layerName}`}
              className='custom-control-input'
              checked={this.state.visible}
              onChange={this.toggleLayerVisibility}
            />
            <label className='custom-control-label' htmlFor={`switch-for-${layerName}`}></label>
            <i className="material-icons md-18" onClick={this.removeLayer}>remove_circle</i>
          </div>
        </Form>
      </li>
    );
  }
}

ActiveLayer.propTypes = {
  layerName: PropTypes.string,
  map: PropTypes.object,
  updateLayers: PropTypes.func,
  type: PropTypes.string,
};

const mapDispatchToProps = (dispatch) => ({
  updateLayers: (key, value) => dispatch(updateLayers(key, value)),
});
const mapStateToProps = (state) => ({
  map: state.map,
  type: state.type,
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveLayer);
