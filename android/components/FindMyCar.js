import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  BackAndroid,
  TouchableHighlight,
  ActivityIndicator,
  AsyncStorage

} from 'react-native';
import MapView from 'react-native-maps';
import keyStore from '../../resources/key/mapApiKey';
import { AdMobBanner } from 'react-native-admob';

export default class FindMyCar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: undefined,
      longitude: undefined,
      marker: { insert: <View></View> },
      animating: true,
      errorMessage: null
    };
    this.directions = [];
    this.directionList = [];
    this.directionContainerHeight = 80;
    this.initialHeight = 80;
    this.userLatitude = undefined;
    this.userLongitude = undefined;
    this.keyGen = new keyStore();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{zIndex: 10}}>
          <ActivityIndicator
            animating={this.state.animating}
            style={styles.activity}
            size='large'/>
        </View>

        <ScrollView
        style={styles.directionsContainer}>
          { this.directions }
        </ScrollView>

        <View
        style={styles.resizeHandler}
        onTouchMove={ this.handleContainerResize.bind(this) }>
          <View style={styles.triangle}/>
        </View>

        <View style={styles.errorMessageContainer}>
          {this.state.errorMessage}
        </View>

        <MapView.Animated
          ref={ref => { this.animatedMap = ref; }}
          style={styles.map}
          mapType="hybrid"
          showsUserLocation={true}

          initialRegion={{
            latitude: 37.78926,
            longitude: -122.43159,
            latitudeDelta: 0.0048,
            longitudeDelta: 0.0020
          }}>

          { this.state.marker.insert }

        </MapView.Animated>
        <TouchableHighlight
        style={styles.button}
        underlayColor='#2F79FB'
        onPress={ this.handleNavigation.bind(this) }>

          <Text style={styles.text}> Get Directions </Text>

        </TouchableHighlight>
        <View style={styles.adBanner}>
          <AdMobBanner
            bannerSize="smartBanner"
            adUnitID="ca-app-pub-6795803926768626/6153789791"
            testDeviceID="EMULATOR"
            didFailToReceiveAdWithError={this.bannerError} />
        </View>
      </View>
    );
  }

  async getCoords() {
    try {
      if (isNaN(this.props.latitude) || !this.props.latitude) {
        this.setState({
          latitude: parseFloat(await AsyncStorage.getItem('@Parked:latitude')),
          longitude: parseFloat(await AsyncStorage.getItem('@Parked:longitude'))
        });
      } else {
        this.setState({
          latitude: this.props.latitude,
          longitude: this.props.longitude
        });
      }
    } catch (error) {
      console.log('getCoords() exception:', error);
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        this.userLatitude = parseFloat(position.coords.latitude);
        this.userLongitude = parseFloat(position.coords.longitude);
        this.setMarker();
        this.getDirections();
      }, error => {
        this.retryGeolocation();
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  componentDidMount() {
    this.getCoords();
    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
          this.props.navigator.pop();
          return true;
      }
      return false
    });
  }

  componentWillUnmount() {
    styles.directionsContainer = {zIndex: -10};
    styles.resizeHandler = {zIndex: -10};
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
        this.userLatitude = parseFloat(position.coords.latitude);
        this.userLongitude = parseFloat(position.coords.longitude);
        this.setMarker();
        this.getDirections();
      }, error => {
        if (this.props.userLatitude) {
          this.animateToCoord(this.props.userLatitude, this.props.userLongitude).bind(this);
        }
        styles.errorMessageContainer = {
          zIndex: 10,
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: 'grey'
        };
        if (this.state.latitude) {
          this.setState({errorMessage: <Text style={styles.errorMessage}> Oops, something went wrong. {"\n"} Did you maybe park at {"\n"} latitude: {this.state.latitude} {"\n"} longitude: {this.state.longitude}</Text>});
        } else {
          this.setState({errorMessage: <Text style={styles.errorMessage}> Oops, something went wrong. {"\n"} Make sure your location is enabled. </Text>});
        }
        this.setState({animating: false});
      }
    );
  }

  setMarker() {
    this.setState({
      marker: {insert:
        <MapView.Marker
        coordinate={
          {
            latitude: this.state.latitude,
            longitude: this.state.longitude
          }
        }>
          <MapView.Callout tooltip={true}>
            <View style={styles.customTooltip}><Text style={{color: 'white', fontWeight: 'bold'}}>You are parked here</Text></View>
          </MapView.Callout>
        </MapView.Marker>
      }
    });
    // In case MapView.Animiated ref hasn't loaded yet..
    setTimeout(this.animateToCoord(this.state.latitude, this.state.longitude).bind(this), 1000);
  }

  animateToCoord(lat, long) {
    this.animatedMap._component.animateToCoordinate({
      latitude: lat,
      longitude: long
    }, 1500);
    this.setState({animating: false});
  }

  getDirections() {
    const apiKey = this.keyGen.getKey();
    let url = ('https://maps.googleapis.com/maps/api/directions/json?origin=' +
     this.userLatitude + ',' + this.userLongitude + '&destination=' +
      37.78825 + ',' + -122.4324 + '&mode=walking&key=' + apiKey);
    let directions = [];
    let key = 0;
    fetch(url)
    .then((response) => {
      let res = JSON.parse(response._bodyInit);
      let steps = res.routes[0].legs[0].steps;
      let len = steps.length;
      let skipped = false;
      let safety;
      for (let i = 0; i < len; i++) {
        let instruction = '';
        let instructions = steps[i].html_instructions;
        for (let j = 0; j < instructions.length; j++) {
          if (instructions[j] === '<' || instructions[j] === '&') {
            safety = 0;
            if (instructions[j] === '&') instruction += ' ';
            while (true) {
              if (instructions[j] === '>' || instructions[j] === ';') break;
              if (safety > 50) break;
              safety++;
              j++;
            }
          } else {
            let char = instructions[j];
            if ((char.charCodeAt(0) > 64 && char.charCodeAt(0) < 91) &&
              instruction[instruction.length - 1] !== ' ') {
              instruction += ' ';
            }
            instruction += instructions[j];
          }
        }
        if (!skipped) {
          if (instruction.length <= 26) {
            if (instruction.trim() === 'Head') continue;
            this.directionContainerHeight = 108;
            this.initialHeight = 108;
          }
          skipped = true;
        }
        directions.push({key: key++, instruction});
      }
      this.directionList = directions;
    })
    .catch((err) => {
      // handle error in postDirections()
    });
  }

  postDirections(directions = []) {

    if (directions.length === 0) {
      this.directions = [<View style={styles.errorTextContainer}><Text style={styles.error}> Directions could not be loaded. Please follow map. </Text></View>];
    } else {
      let result = [];
      for (let i = 0; i < directions.length; i++) {
        result.push(<View style={styles.directionTextContainer} key={directions[i].key}><Text key={directions[i].key} style={styles.directionText}>{directions[i].instruction}</Text></View>);
      }
      this.directions = result;
    }
    styles.directionsContainer = {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: this.directionContainerHeight,
        zIndex: 10,
        backgroundColor: '#48BBEC'
      };
      styles.resizeHandler = {
          position: 'absolute',
          top: this.initialHeight,
          right: 0,
          left: 0,
          height: 15,
          backgroundColor: 'white',
          zIndex: 11
      };
      this.setState({animating: false});
    };

  handleNavigation() {
    if (this.posted === true) return;
    this.setState({animating: true});
    this.postDirections(this.directionList);
    this.posted = true;
  }

  handleContainerResize(evt) {

    if (this.directionContainerHeight >= this.initialHeight) {
      styles.directionsContainer = {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: evt.nativeEvent.pageY,
        zIndex: 15,
        backgroundColor: '#48BBEC'
      };
      styles.resizeHandler = {
          height: 15,
          top: evt.nativeEvent.pageY,
          right: 0,
          left: 0,
          position: 'absolute',
          backgroundColor: 'white',
          zIndex: 11
      };
      this.directionContainerHeight = evt.nativeEvent.pageY;
    } else {
      styles.directionsContainer = {
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          height: this.initialHeight,
          zIndex: 10,
          backgroundColor: '#48BBEC'
        };
        styles.resizeHandler = {
            height: 15,
            top: this.initialHeight,
            right: 0,
            left: 0,
            position: 'absolute',
            backgroundColor: 'white',
            zIndex: 11
        };
      this.directionContainerHeight = this.initialHeight;
      }
      this.forceUpdate();
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
  directionTextContainer: {
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 10
  },
  directionText: {
    color: 'white',
    paddingLeft: 25,
    fontSize: 28
  },
  errorMessageContainer: {
    zIndex: -10
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    fontSize: 30
  },
  resizeHandler: {
    zIndex: -10
  },
  triangle: {
    marginTop: 3,
    alignSelf: 'center',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'red',
    transform: [
      {rotate: '180deg'}
    ]
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 28
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
    marginTop: 300
  },
  button: {
    marginBottom: 95,
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
    left: 0,
    right: 0,
    bottom: 0
  }
});
