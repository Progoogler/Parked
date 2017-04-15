import React, { Component } from 'react';
import { Navigator } from 'react-native';

import Logo from './Logo';
import Main from './Main';
import ParkedMyCar from './ParkedMyCar';
import FindMyCar from './FindMyCar';

export default class Root extends Component {

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
