'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
// var GoogleEarth = require('../js-v3-earth-api/src/googleearth.js');

var ActivityBox = React.createClass({
  getInitialState: function() {
    return {
      activities: []
    };
  },

  componentWillMount: function(){
    $.getJSON(this.props.url, function (data) {
      this.setState({
        activities: data
      });
    }.bind(this));
  },



  render: function() {
    var self = this;
    console.log(this.state.activities);
    return (
      <div>
      </div>
    );
  }
});

module.exports = ActivityBox;
