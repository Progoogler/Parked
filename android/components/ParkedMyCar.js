import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  BackAndroid,
  TouchableHighlight,
  ActivityIndicator,
  AsyncStorage
} from 'react-native';
import MapView from 'react-native-maps';
import { AdMobBanner } from 'react-native-admob';

export default class ParkedMyCar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: this.props.latitude || 37.78942,
      longitude: this.props.longitude || -122.43159,
      checkmark: {opacity: 0},
      marker: { insert: <View></View> },
      animating: true,
      errorMessage: null
    }
  }

  render() {

    return (
      <View style={styles.container}>
        <View style={styles.adBanner}>
          <AdMobBanner
            bannerSize="smartBanner"
            adUnitID="ca-app-pub-6795803926768626/6153789791"
            testDeviceID="EMULATOR"
            didFailToReceiveAdWithError={this.bannerError} />
        </View>
        <View style={{zIndex: 10}}>
          <ActivityIndicator
            animating={this.state.animating}
            style={styles.activity}
            size='large'/>
        </View>

        <View style={styles.errorMessageContainer}>
          {this.state.errorMessage}
        </View>

        <MapView.Animated
          style={styles.map}
          ref={ref => { this.animatedMap = ref; }}
          mapType="hybrid"

          initialRegion={{
            latitude: this.props.latitude ? this.props.latitude : this.state.latitude,
            longitude: this.props.longitude ? this.props.longitude : this.state.longitude,
            latitudeDelta: 0.0048,
            longitudeDelta: 0.0020
          }}>

          { this.state.marker.insert }

        </MapView.Animated>

        <View style={ this.state.checkmark }>
          <Image source={require('../../resources/images/checkmark.png')} />
        </View>

        <TouchableHighlight
          style={styles.button}
          underlayColor='#2F79FB'
          onPress={ this.saveCoords.bind(this) }>

          <Text style={styles.text}> Parked here! </Text>

        </TouchableHighlight>

      </View>
    );
  }

  componentWillMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
          this.props.navigator.pop();
          return true;
      }
      return false
    });
  }

  componentDidMount() {
    if (!this.props.latitude || isNaN(this.props.latitude)) {
      navigator.geolocation.getCurrentPosition(
        position => {
          let latitude = parseFloat(position.coords.latitude);
          let longitude = parseFloat(position.coords.longitude);
          this.setState({ latitude, longitude });
          this.setMarker();
          AsyncStorage.setItem('@Parked:latitude', this.state.latitude + '');
          AsyncStorage.setItem('@Parked:longitude', this.state.longitude + '');
        }, error => {
          this.retryGeolocation();
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
    } else {
      setTimeout(this.setMarker.bind(this), 2000);
      AsyncStorage.setItem('@Parked:latitude', this.props.latitude + '');
      AsyncStorage.setItem('@Parked:longitude', this.props.longitude + '');
    }
  };

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', () => {
      if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
          this.props.navigator.pop();
          return true;
      }
      return false;
    });
  }

  retryGeolocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        let latitude = parseFloat(position.coords.latitude);
        let longitude = parseFloat(position.coords.longitude);
        this.setState({ latitude, longitude });
        this.setMarker();
        AsyncStorage.setItem('@Parked:latitude', this.state.latitude + '');
        AsyncStorage.setItem('@Parked:longitude', this.state.longitude + '');
      }, error => {
        styles.errorMessageContainer = {
          zIndex: 10,
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: 'grey'
        };
        this.setState({animating: false});
        this.setState({errorMessage: <Text style={styles.errorMessage}>Could not access your current geolocation. {"\n"} Please try again.</Text>});
      }
    );
  }

  checkStyle() {
    if (this.state.animating === true || this.state.errorMessage !== null) return;
    this.setState({checkmark:
      {
        marginBottom: 195,
        height: 120,
        width: 120,
        borderWidth: 3,
        borderColor: 'green',
        borderRadius: 70,
        justifyContent: 'space-around',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'white'
      }
    });
  }

  saveCoords() {
    this.checkStyle();
    AsyncStorage.setItem('@Parked:latitude', this.state.latitude + '');
    AsyncStorage.setItem('@Parked:longitude', this.state.longitude + '');
    setTimeout(() => {
      this.setState({checkmark: {opacity: 0}});
    }, 1500);
  }

  setMarker() {
    this.setState({
      marker: {insert:
        <MapView.Marker draggable
          coordinate={
            {
              latitude: this.state.latitude,
              longitude: this.state.longitude
            }
          }
          onDragEnd={(e) => {
            this.setState({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            });
          }}>

          <MapView.Callout tooltip={true}>
            <View style={styles.customTooltip}><Text style={{color: 'white', fontWeight: 'bold'}}>You are parked here</Text></View>
          </MapView.Callout>
        </MapView.Marker>
    }
    });
    setTimeout(this.animateToCoord.bind(this), 1000);
  }

  animateToCoord() {
    this.animatedMap._component.animateToCoordinate({
      latitude: this.state.latitude,
      longitude: this.state.longitude
    }, 1500);
    this.setState({animating: false});
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  customTooltip: {
    backgroundColor: '#48BBEC',
    borderRadius: 5,
    padding: 5,
    height: 28,
    justifyContent: 'center'
  },
  activity: {
    marginBottom: 100
  },
  errorMessageContainer: {
    zIndex: -10
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    fontSize: 30
  },
  button: {
    marginBottom: 90,
    width: 300,
    height: 70,
    zIndex: 10,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'green'
  },
  text: {
    fontSize: 36,
    color: 'white'
  },
  adBanner: {
    position: 'absolute',
    zIndex: 100,
    left: 0,
    right: 0,
    top: 0
  }
})
