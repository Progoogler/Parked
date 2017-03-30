import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  BackAndroid,
  Dimensions,
  TouchableHighlight,
  AsyncStorage
} from 'react-native';
import MapView from 'react-native-maps';

export default class ParkedMyCar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: this.props.latitude,
      longitude: this.props.longitude,
      checkmark: {opacity: 0},
      marker: []
    }
  }

  componentWillMount() {
    this.setMarker();
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
          this.props.navigator.pop();
          return true;
      }
      return false
    });
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

  checkStyle() {
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
    setTimeout(() => {
      this.setState({checkmark: {opacity: 0}});
    }, 1500);
    try {
      AsyncStorage.setItem('@Parked:latitude', this.state.latitude + '');
      AsyncStorage.setItem('@Parked:longitude', this.state.longitude + '');
    } catch (error) {
      console.log(error);
    }
    console.log('saved cooords: STATE', this.state)
  }

  async setMarker() {
    let result = [];
    if (!this.props.latitude) {
      await navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude)
          });
          result.push(          
            <MapView.Marker draggable
              coordinate={
                {
                  latitude: latitude,
                  longitude: longitude
                }
              }
              onDragEnd={(e) => {
                this.setState({
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude
                });
              }}
              title={ 'You are parked here' }/>);
        }, error => console.log(error), { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
      )
    } else {
      result.push(        
        <MapView.Marker draggable
          coordinate={
            {
              latitude: this.props.latitude,
              longitude: this.props.longitude
            }
          }
          onDragEnd={(e) => {
            this.setState({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            });
          }}
          title={ 'You are parked here' }/>);      
    }
    console.log('marker', result)
    this.setState({marker: result});
  }

  render() {

    AsyncStorage.setItem('@Parked:latitude', this.state.latitude + '');
    AsyncStorage.setItem('@Parked:longitude', this.state.longitude + '');

    // invalid props.style key featureType supplied to AIRMap
/*    let mapStyle = [
      {
        "featureType": "road.local",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#2414f0"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.icon",
        "stylers": [
          {
            "weight": 7.5
          }
        ]
      }
    ]*/

    return (
      <View style={styles.container}>
        <MapView 
          style={styles.map}
          //customMapStyle={mapStyle}
          mapType="hybrid"

          initialRegion={{
            latitude: this.props.latitude ? this.props.latitude : 37.78825,
            longitude: this.props.longitude ? this.props.longitude : -122.4324,
            latitudeDelta: 0.0048,
            longitudeDelta: 0.0020
          }}>

          { this.state.marker[0] }

        </MapView>

        <View style={ this.state.checkmark }>
          <Image source={require('../../resources/images/checkmark.png')} />
        </View>

        <TouchableHighlight 
          style={styles.button}
          underlayColor='blue'
          onPress={ this.saveCoords.bind(this) }>

          <Text style={styles.text}> Parked here! </Text>

        </TouchableHighlight>

      </View>
    );
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
  }
})