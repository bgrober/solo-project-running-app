'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

var ProfileBox = React.createClass({
  getInitialState: function() {
    return {
      profile: []
    };
  },

  componentWillMount: function(){
    $.getJSON(this.props.url, function (data) {
      this.setState({
        profile: data
      });
    }.bind(this));
  },
  render: function() {
    console.log(this.state.profile);
    return (
      <div>
        <img src={this.state.profile.profile}/>
        <p>{this.state.profile.firstname + ' ' + this.state.profile.lastname}</p>
        <p>{this.state.profile.city+ ', ' + this.state.profile.state}</p>
      </div>
    );
  }
});

module.exports = ProfileBox;
