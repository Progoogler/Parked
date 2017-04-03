


// todo: extra memory please!
// activity indicator or no?



import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ActivityIndicator,
  BackAndroid,
  AsyncStorage
} from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: '',
      longitude: '',
      // style error message
      message: ''
    };
  }

  render() {

    return (
      <View style={styles.container}>

        <Text style={styles.title}> Parked </Text>

        <View style={styles.buttonContainer}>
          <TouchableHighlight
          style={styles.parkedButton}
          underlayColor='green'
          onPress={ this.parkedButtonOnPress.bind(this) }>
            <Text style={styles.label}> Parked car </Text>
          </TouchableHighlight>

          <TouchableHighlight
          style={styles.findButton}
          underlayColor='green'
          onPress={ this.findButtonOnPress.bind(this) }>
            <Text style={styles.label}> Find car </Text>
          </TouchableHighlight>
        </View>

        <Text> { this.state.message } </Text>

      </View>
    );
  }

  async componentWillMount() {
    this.latitude = parseFloat(await AsyncStorage.getItem('@Parked:latitude'));
    this.longitude = parseFloat(await AsyncStorage.getItem('@Parked:longitude'));
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: "YES",
        cancel: "NO"
    }).then(function(success) {
        navigator.geolocation.getCurrentPosition(
          position => {
            let latitude = parseFloat(position.coords.latitude);
            let longitude = parseFloat(position.coords.longitude);
            this.setState({ latitude, longitude });
          }, error => console.log(error), { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
        )
      }.bind(this)
    ).catch((error) => {
      console.log(error.message);
    });
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.exitApp;
    });
  }

  parkedButtonOnPress() {
    this.props.navigator.push({
      page: 'ParkedMyCar',
      passProps: {
        latitude: this.state.latitude,
        longitude: this.state.longitude
      }
    });
  }

  findButtonOnPress() {
    this.props.navigator.push({
      page: 'FindMyCar',
      passProps: {
        latitude: this.latitude,
        longitude: this.longitude
      }
    });
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    fontSize: 66,
    fontWeight: 'bold',
    color: '#48BBEC',
    marginTop: 48,
    textShadowColor: 'blue',
    textShadowOffset: {width: 2, height: 2}
  },
  buttonContainer: {
    marginTop: 65,
  },
  parkedButton: {
    width: 360,
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'blue',
    justifyContent: 'center',
    marginBottom: 50
  },
  findButton: {
    width: 360,
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: 'red'
  },
  label: {
    fontSize: 36,
    color: 'white',
    textShadowColor: 'grey',
    textShadowOffset: {width: 2, height: 2},
    justifyContent: 'center',
    alignSelf: 'center'
  }
});
