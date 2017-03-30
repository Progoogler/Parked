import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator
} from 'react-native';
import Logo from './android/modules/Logo';
import Main from './android/modules/Main';
import ParkedMyCar from './android/modules/ParkedMyCar';
import FindMyCar from './android/modules/FindMyCar';

class Parked extends Component {

  renderScene(route, navigator) {
    if (route.page === 'Logo') {
      return <Logo navigator={navigator} />
    }
    if (route.page === 'Main') {
      return <Main navigator={navigator} />
    }
    if (route.page === 'ParkedMyCar') {
      return <ParkedMyCar navigator={navigator} {...route.passProps} />
    }
    if (route.page === 'FindMyCar') {
      return <FindMyCar navigator={navigator} {...route.passProps} />
    }
  }

  render() {
    return (
      <Navigator
        initialRoute={{ page: 'Logo' }}
        renderScene={ this.renderScene }
      />
    );
  }
}



AppRegistry.registerComponent('Parked', () => Parked);