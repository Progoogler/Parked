import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';

export default class Logo extends Component {
  constructor(props) {
    super(props);
    this.state = { displayed: false };
  }

  render() {
    setTimeout(() => {
      if (!this.state.displayed) {
        this.setState({ displayed: true });
        this.props.navigator.push({ page: 'Main' });
      } else {
        return;
      }
    }, 2000);

    return (
      <View style={styles.container}>
        <Text style={styles.title}> Parked </Text>
        <Text style={styles.image}> Poop </Text>
        <Text></Text>
      </View>
    );
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

  },
  image: {

  }
});