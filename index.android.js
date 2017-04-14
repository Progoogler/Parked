import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import Root from './android/modules/Root';

class Parked extends Component {

  render() {
    return (
      <Root/>
    );
  }
}

AppRegistry.registerComponent('Parked', () => Parked);
