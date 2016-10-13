"use strict";

const { EventEmitterMixin } = require("event-emitter-mixin");
const React = require("react"),
      Component = EventEmitterMixin(React.Component),
      PropTypes = React.PropTypes;
const TimeGraph = require("@yavuzmester/time-graph");
const _ = require("underscore");
const shallowEqual = require("shallowequal");

const propTypes = {
    title: PropTypes.string,
    valueAxisTitle: PropTypes.string,
    divWidth: PropTypes.number.isRequired,
    divHeight: PropTypes.number.isRequired,
    contextDivHeight: PropTypes.number.isRequired,
    svgMargin: PropTypes.shape({
        left: PropTypes.number.isRequired,
        right: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        bottom: PropTypes.number.isRequired
    }).isRequired,
    contextSvgMargin: PropTypes.shape({
        left: PropTypes.number.isRequired,
        right: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        bottom: PropTypes.number.isRequired
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        isoDate: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired
    })),
    logScale: PropTypes.bool,
    brushSelection: PropTypes.arrayOf(PropTypes.string)
};

const defaultProps = {
    title: "",
    valueAxisTitle: "",
    data: [],
    logScale: false,
    brushSelection: []
};

class TimeGraphWithContext extends Component {
    constructor(props) {
        super(props);
        this.onBrush = this.onBrush.bind(this);
    }

    data(options = {}) {
        const { forContextGraph /*: ?boolean */ } = options,
              { data, brushSelection } = this.props;

        if (forContextGraph || brushSelection.length == 0) {
            return data;
        } else {
            const [start, end] = brushSelection.map(b => new Date(b));

            return data.filter(d => {
                const date = new Date(d.isoDate);
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            });
        }
    }

    render() {
        const {
            title,
            valueAxisTitle,
            divWidth,
            divHeight,
            contextDivHeight,
            svgMargin,
            contextSvgMargin,
            logScale,
            brushSelection
        } = this.props;

        const data = this.data(),
              contextData = this.data({ forContextGraph: true });

        return React.createElement(
            "div",
            { className: "time-graph-with-context" },
            React.createElement(TimeGraph, { title: title, valueAxisTitle: valueAxisTitle, divWidth: divWidth, divHeight: divHeight,
                svgMargin: svgMargin, data: data, logScale: logScale, valueAxisTicksEnabled: true }),
            React.createElement(TimeGraph, { ref: "context-time-graph", divWidth: divWidth, divHeight: contextDivHeight,
                svgMargin: contextSvgMargin, data: contextData, logScale: logScale, brushEnabled: true,
                brushSelection: brushSelection })
        );
    }

    contextTimeGraph() {
        return this.refs["context-time-graph"];
    }

    componentDidMount() {
        const contextTimeGraph = this.contextTimeGraph();

        contextTimeGraph.on("brush", this.onBrush);
    }

    onBrush(e = {} /*: object */) {
        const { newBrushSelection } = e;
        this.emit("brush", { newBrushSelection: newBrushSelection });
    }

    shouldComponentUpdate(nextProps /*: object */) {
        return !shallowEqual(_.pick(this.props, Object.keys(propTypes)), _.pick(nextProps, Object.keys(propTypes)));
    }
} //end of TimeGraphWithContext component def

TimeGraphWithContext.propTypes = propTypes;
TimeGraphWithContext.defaultProps = defaultProps;

module.exports = TimeGraphWithContext;
