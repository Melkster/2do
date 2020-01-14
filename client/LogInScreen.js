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
  Image,
  Text,
  TouchableOpacity
} from "react-native";
import socket from "./socket";
import styles from "./styles";
import logo from "./assets/logo.png";
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

  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener("didFocus", () => {
      // `didFocus` is necessary because the `authenticate` listeners dissappears every time focus is lost
      socket.on("authenticate", (user, err) => this._handleAuthenticate(user, err));
    });
  }

  componentWillUnmount() {
    socket.off("authenticate"); // Remove socket listeners on unmount
    this.didFocusSubscription.remove();
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="height" style={styles.container} onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
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

  /**
   * Sends an `authenticate` event if `username` and `password` are defined.
   */
  _logInAsync = (username, password) => {
    if (!username || !password) {
      Alert.alert(failed_error, "Please enter your username and password");
    } else {
      socket.emit("authenticate", username, password);
    }
  };

  /**
   * Handles the `authenticate` event by logging in the user.
   *
   * Expects a `user` object and an `err`. If there is no `err`, this expects
   * `user` to be an object containing in `_id`, `name` and a list `group`
   * containing the id's of all groups that the user is a member of.
   */
  _handleAuthenticate = (user, err) => {
    if (err) Alert.alert(failed_error, err);
    else {
      AsyncStorage.setItem("userToken", String(user._id));
      this.props.navigation.navigate("App", { user });
    }
  };

  /**
   * Intended to be used as a callback function to set username and password
   * when navigating backfrom account creation page
   */
  setFields = (username, password) => {
    this.setState({ username, password });
  };
}
