'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var path = require('path');
var imgPath = path.join(__dirname, '/../build/ConnectWithStrava.png');

var SignInBox = React.createClass({


  render: function() {
    console.log(imgPath);
    return (
      <div>
        <img src={imgPath}/>
      </div>
    )
  }
});

module.exports = SignInBox;
