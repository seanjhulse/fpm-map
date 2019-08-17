import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from './store/reducers';
import Map from './map.js';
import Sidebar from './components/sidebar';

const store = createStore(reducers)

ReactDOM.render(
	<Provider store={store}>
		<Map />
		<Sidebar />
	</Provider>,
	document.getElementById('app')
);