import React from 'react';
import ReactDOM from 'react-dom';
import App from './modules/app';
import About from './modules/about';
import { Router, Route, hashHistory } from 'react-router'

ReactDOM.render(
  <Router history={hashHistory}>
    <Router path="/" component={App} />
    <Router path="/about" component={About} />
  </Router>,
  document.getElementById('app')
);
