"use strict";

const { EventEmitterMixin } = require("event-emitter-mixin");
const React = require("react"),
      Component = EventEmitterMixin(React.Component),
      PropTypes = React.PropTypes;
const TimeGraph = require("@yavuzmester/time-graph");

const propTypes = {
    title: PropTypes.string.isRequired,
    valueAxisTitle: PropTypes.string.isRequired,
    divWidth: PropTypes.number.isRequired,
    divHeight: PropTypes.number.isRequired,
    contextDivHeight: PropTypes.number.isRequired,
    svgMargin: PropTypes.shape({
        left: PropTypes.number.isRequired,
        right: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        bottom: PropTypes.number.isRequired
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        isoDate: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        groupId: PropTypes.string.isRequired
    }).isRequired).isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
    }).isRequired).isRequired,
    logScale: PropTypes.bool.isRequired,
    brushSelection: PropTypes.arrayOf(PropTypes.string)
};

const defaultProps = {
    logScale: false,
    brushSelection: []
};

class TimeGraphWithContext extends Component {
    data(options = {}) {
        const { forContextGraph /*: ?boolean */ } = options,
              { data, brushSelection } = this.props;

        if (forContextGraph || !brushSelection || brushSelection.length == 0) {
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
        const { title, valueAxisTitle, divWidth, divHeight, contextDivHeight, svgMargin, groups, logScale, brushSelection } = this.props,
              data = this.data(),
              contextData = this.data({ forContextGraph: true });

        return React.createElement(
            "div",
            { className: "time-graph-container" },
            React.createElement(TimeGraph, { title: title, valueAxisTitle: valueAxisTitle, divWidth: divWidth, divHeight: divHeight,
                svgMargin: svgMargin, data: data, groups: groups, logScale: logScale, valueAxisTicksEnabled: true }),
            React.createElement(TimeGraph, { ref: "context-time-graph", divWidth: divWidth, divHeight: contextDivHeight,
                svgMargin: svgMargin, data: contextData, groups: groups, logScale: logScale, brushEnabled: true })
        );
    }

    contextTimeGraph() {
        return this.refs["context-time-graph"];
    }

    componentDidMount() {
        const contextTimeGraph = this.contextTimeGraph();

        contextTimeGraph.on("brush", e => {
            this.emit("brush", e);
        });
    }
} //end of TimeGraphWithContext component def

TimeGraphWithContext.propTypes = propTypes;

module.exports = TimeGraphWithContext;