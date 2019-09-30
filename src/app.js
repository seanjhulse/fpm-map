import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from './store/reducers';
import Map from './map';
import Sidebar from './components/sidebar';

const store = createStore(reducers);

ReactDOM.render(
  <Provider store={store}>
    <Map />
    <Sidebar />
  </Provider>,
  // eslint-disable-next-line no-undef
  document.getElementById('app'),
);
