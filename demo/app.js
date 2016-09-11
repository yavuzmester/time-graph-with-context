"use strict";

const TimeGraphWithContext = require("@yavuzmester/time-graph-with-context");
const React = require("react");
const ReactDOM = require("react-dom");

const props = require('../data.json');

setTimeout(() => {
    const tgs = ReactDOM.render(React.createElement(TimeGraphWithContext, props), document.getElementById("root"));
    tgs.on("title-click", () => console.log("title-click"));
}, 100);
