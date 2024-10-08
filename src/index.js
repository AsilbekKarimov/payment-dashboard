import "./index.css"
import React from 'react';
import ReactDOM from 'react-dom/client';
import RouterConfig from './router/Router';
import "./index.css"
import { Provider } from 'react-redux';
import store from './store';
import './i18n'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <RouterConfig />
    </Provider>
);
