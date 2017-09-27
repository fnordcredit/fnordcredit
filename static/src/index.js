// @flow
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/app";
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const app = <App server="localhost:8000" />;

ReactDOM.render(app, document.getElementById("content"));
