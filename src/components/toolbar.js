import React, { Component } from 'react';
import ActiveLayers from './toolbar/active-layers';
import Actions from './actions';

class Toolbar extends Component {
  constructor() {
    super();

    this.state = {
      title: 'Active Layers',
    };
  }

  render() {
    return (
      <div className="toolbar">
        <Actions />
        <h2 className="toolbar-label">{this.state.title}</h2>
        <ActiveLayers />
      </div>
    )
  }
}


export default Toolbar;
