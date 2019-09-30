import React, { Component } from 'react';
import AddLayerAction from './actions/add-layer-action';

class Actions extends Component {
  render() {
    return (
      <div className="buttons-toolbar-container">
        <AddLayerAction />
      </div>
    );
  }
}


export default Actions;
