import React, { Component } from "react";
import { ActivityIndicator, AsyncStorage, Button, StatusBar, StyleSheet, View } from "react-native";
import socket from "./socket";
import styles from "./styles";

export default class LogInScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };
  }

  static navigationOptions = {
    title: "2do log in"
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="height" style={styles.container} onPress={Keyboard.dismiss}>
          <TextInput
            value={this.state.username}
            onChangeText={username => this.setState({ username })}
            placeholder={"Username"}
            style={styles.input}
          />
          <TextInput
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
            placeholder={"Password"}
            secureTextEntry={true}
            style={styles.input}
          />
          <Button
            title={"Login"}
            style={styles.input}
            onPress={() => this._signInAsync(this.state.username, this.state.password)}
          />

          <Text>{this.state.username}</Text>
          <Text>{this.state.password}</Text>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

  _signInAsync = async (username, password) => {
    if (!username || !password) return Alert.alert("Login failed", "Please enter your username and password");
    // socket.emit("authenticate", username, password);
    // await socket.on("authenticate", userID => (this.props = { userID }));
    // socket.emit("getGroups", userID);

    await AsyncStorage.setItem("userToken", "signedIn");
    this.props.navigation.navigate("App");
  };
}
