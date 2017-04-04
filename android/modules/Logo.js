import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated
} from 'react-native';

export default class Logo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayed: false,
      marginLeftOfCar: new Animated.Value(0)
    };
  }

  render() {

    setTimeout(() => {
      if (!this.state.displayed) {
        this.setState({ displayed: true });
        this.props.navigator.immediatelyResetRouteStack([{ page: 'Main' }]);
      } else {
        return;
      }
    }, 1400);

    return (
      <View style={styles.container}>
        <Text style={styles.title}> Parked </Text>
        <View style={{alignItems: 'center', marginBottom: 80}}>
          <Image source={require('../../resources/images/pin.png')} />
          <Animated.Image source={require('../../resources/images/car.png')} style={{marginRight: this.state.marginLeftOfCar}} />
        </View>
        <Text> { /* filler for the end of column style */ } </Text>
      </View>
    );
  }





  componentDidMount() {
    setTimeout(function() {
      this.state.marginLeftOfCar.setValue(30);
      Animated.spring(
        this.state.marginLeftOfCar,
        {
          toValue: -1200,
          friction: 1,
        }
      ).start()
    }.bind(this), 700);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 66,
    fontWeight: 'bold',
    color: '#48BBEC',
    marginTop: 48,
    textShadowColor: 'blue',
    textShadowOffset: {width: 2, height: 2}
  }
});
