import React, { Component } from "react";
import {
  Alert,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  Modal,
  View
} from "react-native";
import socket from "./socket";
import styles from "./styles";

export default class LogInScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password1: "",
      password2: "",
      modalVisible: false,
      credentialsStatus: ""
    };

    socket.on("register", (_, err) => this._handleRegister(err));
  }

  static navigationOptions = {
    title: "Create account"
  };

  // Remove socket listeners on unmount
  componentWillUnmount() {
    socket.removeAllListeners();
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="height" style={styles.container} onPress={Keyboard.dismiss}>
          <TextInput
            value={this.state.username}
            onChangeText={username => this._setStateAndUpdateStatus({ username })}
            placeholder={"Username"}
            style={styles.input}
          />
          <TextInput
            value={this.state.password1}
            onChangeText={password1 => this._setStateAndUpdateStatus({ password1 })}
            placeholder={"Password"}
            secureTextEntry={true}
            style={styles.input}
          />
          <TextInput
            value={this.state.password2}
            onChangeText={password2 => this._setStateAndUpdateStatus({ password2 })}
            placeholder={"Please repeat your password"}
            secureTextEntry={true}
            style={styles.input}
          />

          <Text style={styles.errorStatusIndicator}>{this._capitalize(this.state.credentialsStatus)}</Text>

          <Button title={"Create account"} style={styles.input} onPress={this._confirm} />

          <Modal visible={this.state.modalVisible} animationType={"slide"} onRequestClose={this._closeModal}>
            <View style={styles.container}>
              <Text>You successfully created an account</Text>
              <Button onPress={this._closeModal} title="Back to login" />
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

  _setStateAndUpdateStatus = state => {
    this.setState(state, () => {
      return this._credentialsStatus();
    });
  };

  _validateCredentials = (username, password1, password2) => {};

  /**
   * Sets this.state.credentialsStatus.
   *
   * If the two passwords match, it sets this.state.credentialsStatus to
   * `state`, otherwise it sets it to "Paswords don't match".
   */
  _credentialsStatus = status => {
    if (this.state.password1 && this.state.password2 && this.state.password1 !== this.state.password2) {
      status = "Passwords don't match";
    }

    if (status !== this.state.credentialsStatus) {
      // Check if this.state.credentialsStatus will change to prevent infinite recursive `setState()` calls
      this.setState({ credentialsStatus: status });
    }
  };

  /**
   * Sets the visibility of modal.
   */
  _setModalVisible = visible => {
    this.setState({ modalVisible: visible });
  };

  _confirm = () => {
    this._registerUser();
  };

  /**
   * Closes modal and navigates back to the initial screen. Also calls the
   * `setFiels()` callback function, which passes `username` and `password` to
   * the initial screen.
   */
  _closeModal = () => {
    this._setModalVisible(false);
    this.props.navigation.popToTop();
    this.props.navigation.state.params.setFields(this.state.username, this.state.password1);
  };

  /**
   * Sends a `register` event if `username` and `password` are defined.
   */
  _registerUser = callback => {
    if (this.state.password1 === this.state.password2) {
      socket.emit("register", this.state.username, this.state.password1);
    }
  };

  /**
   * Registers user.
   *
   * If there is no `err`, displays confirmation modal.
   */
  _handleRegister = err => {
    if (err) this._credentialsStatus(err);
    else this._setModalVisible(true);
  };

  /**
   *  Capitalizes the first letter in `string` if `string` is defined.
   */
  _capitalize = string => {
    return string ? string.charAt(0).toUpperCase() + string.substring(1) : string;
  };
}
