import React, { Component } from "react";
import {
  Alert,
  AsyncStorage,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  View,
  Text,
  TouchableOpacity
} from "react-native";
import socket from "./socket";
import styles from "./styles";
import { Separator } from "react-native-tableview-simple";

failed_error = "Login failed";

export default class LogInScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };
  }

  static navigationOptions = {
    title: "2Do log in"
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="height" style={styles.container} onPress={Keyboard.dismiss}>
          <View style={styles.container}>
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
              onPress={() => this._logInAsync(this.state.username, this.state.password)}
            />
            <Separator />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => this.props.navigation.navigate("CreateAccount", { setFields: this.setFields })}
            >
              <Text>Create account</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

  _logInAsync = (username, password) => {
    if (!username || !password) return Alert.alert(failed_error, "Please enter your username and password");

    socket.emit("authenticate", username, password);
    socket.on("authenticate", (userID, err) => {
      if (err) return Alert.alert(failed_error, err);

      socket.emit("getGroups", userID);
      socket.on("getGroups", (userID, err) => {
        if (err) return Alert.alert(failed_error, err);
        AsyncStorage.setItem("userToken", String(userID));
        this.props.navigation.navigate("App", { userID });
      });
    });
  };

  // Intended to be used as a callback function to set username and password
  // when navigating backfrom account creation page
  setFields = (username, password) => {
    this.setState({ username, password });
  };
}
