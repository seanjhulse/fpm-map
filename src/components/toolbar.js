import React, { Component } from 'react';
import ActiveLayers from './toolbar/active-layers';
import Actions from './actions';
import BuildingLayer from './toolbar/building-layer';

class Toolbar extends Component {
  constructor() {
    super();

    this.state = {
      title: 'Layers',
    };
  }

  render() {
    return (
      <div className="toolbars">
        <div className="toolbar">
          <Actions />
          <h2 className="toolbar-label">{this.state.title}</h2>
          <ActiveLayers />
        </div>
        <div className="toolbar">
          <h2 className="toolbar-label">Building</h2>
          <BuildingLayer />
        </div>
      </div>
    );
  }
}


export default Toolbar;
