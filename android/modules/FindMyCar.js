import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  BackAndroid,
  TouchableHighlight,
  ScrollView,
  AsyncStorage
} from 'react-native';
import MapView from 'react-native-maps';

export default class FindMyCar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: '',
      longitude: '',
      directions: [],
      directionList: []
    }
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude)
        });
        this.getDirections();
      },
      error => {
        // error
      }
    );
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

  getDirections() {
    let directions = [];
    fetch('https://maps.googleapis.com/maps/api/directions/json?origin=' +
     this.state.latitude + ',' + this.state.longitude + '&destination=' +
      37.78825 + ',' + -122.4324 + '&mode=walking&key=AIzaSyALRq2Ep7Rfw61lvdZLMzhYP41YPglqA68')
    .then((response) => { 
      let res = JSON.parse(response._bodyInit);
      let steps = res.routes[0].legs[0].steps;
      let len = steps.length;
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
        directions.push(instruction);
      }
      this.setState({directionList: directions});
    })
    .catch((err) => {
      console.log(err);
    });
  }

  postDirections(directions = []) {
    if (directions.length === 0) return this.setState({directions: [<Text style={styles.error}> Problem fetching directions </Text>]});
    let result = [];
    for (let i = 0; i < directions.length; i++) {
      result.push(<View style={styles.directionTextContainer}><Text style={styles.directionText}>{directions[i]}</Text></View>);
    }
    this.setState({directions: result});
    styles.directionsContainer = {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: 80,
        zIndex: 10,
        backgroundColor: 'white'
      }
    };

  handleNavigation() {
    this.postDirections(this.state.directionList);    
    const keepPace = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          let latitude = parseFloat(position.coords.latitude);
          let longitude = parseFloat(position.coords.longitude);
          if (this.state.latitude -  latitude < .0009 ||
           this.state.longitude - longitude < .0009) {
            clearInterval(keepPace);
          }
          this.setState({
            latitude,
            longitude
          });
        },
        error => {
          // error
        }
      );
    }, 4000);
  }

  handleContainerResize(evt) {
    styles.directionsContainer = {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      height: evt.nativeEvent.pageY,
      zIndex: 15,
      backgroundColor: 'white'
    };
    this.forceUpdate();
  }

  render() {
    return (
      <View style={styles.container}>
        <View 
        style={styles.directionsContainer} 
        onTouchMove={ this.handleContainerResize.bind(this) }>

          { this.state.directions }

        </View>
        <MapView 
          style={styles.map}
          mapType="hybrid"
          initialRegion={{
            latitude: this.props.latitude ? this.props.latitude : 37.78825,
            longitude: this.props.longitude ? this.props.longitude : -122.4324,
            latitudeDelta: 0.0048,
            longitudeDelta: 0.0020
          }}>

          <MapView.Marker
            coordinate={
              {
                latitude: this.props.latitude,
                longitude: this.props.longitude
              }
            }
            title={ 'You are parked here' }/>

          <MapView.Marker
            coordinate={
              {
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }
            }
            pinColor='green'/>

        </MapView>
        <TouchableHighlight 
        style={styles.button}
        underlayColor='blue'
        onPress={ this.handleNavigation.bind(this) }>

          <Text style={styles.text}> Get Directions </Text>

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
  directionTextContainer: {
    borderWidth: 2,
    paddingTop: 6,
    paddingBottom: 6
  },
  directionText: {
    color: 'blue',
    paddingLeft: 25,
    fontSize: 28
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
  },
});