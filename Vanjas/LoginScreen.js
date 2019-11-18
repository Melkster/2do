import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';

export default class LoginScreen extends React.Component {
  state = {
    text: ""
  };

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{width: 150, height: 200, backgroundColor: 'powderblue'}}>
        <Text>Username:</Text>
        <TextInput
          style={{height: 40}}
          placeholder="Type here!"
          onChangeText={(text) => this.setState({text})}
          //value={this.state.text}
        />
        <Button
          title="Login"
          onPress={() => {
            this.props.navigation.navigate('Groups')}
            // use info from textfields / auth
          }
        />
        </View>
      </View>
    );
  }
}
