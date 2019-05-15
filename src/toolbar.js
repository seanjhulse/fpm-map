import React, { Component } from 'react';

class Toolbar extends Component {
	constructor(props) {
		super(props);
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.checked = this.checked.bind(this);
	}

	toggleDropdown(event) {
		event.target.classList.toggle('active');
	}

	checked(event) {
		this.props.updateLayers(event.target.parentElement.parentElement.id, event.target.id, event.target.checked);
	}

	render() {
		return (
			<div id="toolbar">
				<ul id="toolbar-options">
					<li id="chiller-layers" className="dropdown" onClick={this.toggleDropdown}>
						Chillers
						<ul className="dropdown-items" id="chillers">
							<li>
								<input type="checkbox" id="supply-temp" onChange={this.checked} />
								<label htmlFor="chillers-supply-temp" className="toolbar-label">Supply temperature</label>
							</li>
							<li>
								<input type="checkbox" id="water-flow" onChange={this.checked} />
								<label htmlFor="chillers-water-flow" className="toolbar-label">Water flow</label>
							</li>
							<li>
								<input type="checkbox" id="return-temp" onChange={this.checked} />
								<label htmlFor="chillers-return-temp" className="toolbar-label">Return Temp</label>
							</li>
						</ul>
					</li>
					<li id="compressed-air" className="dropdown" onClick={this.toggleDropdown}>
						Compressed Air
						<ul className="dropdown-items" id="compressors">
							<li>
								<input type="checkbox" id="pressure" onChange={this.checked} />
								<label htmlFor="pressure" className="toolbar-label">Compressed air pressure</label>
							</li>
						</ul>
					</li>
					<li id="city-water" className="dropdown" onClick={this.toggleDropdown}>
						Hot Water
						<ul className="dropdown-items" id="hotwater">
							<li>
								<input type="checkbox" id="return-temp" onChange={this.checked} />
								<label htmlFor="city-water-return-temp" className="toolbar-label">Return Temp</label>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		);
	}
}

export default Toolbar;