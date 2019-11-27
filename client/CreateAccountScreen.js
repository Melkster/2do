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
      modalVisible: false
    };
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
            onChangeText={username => this.setState({ username })}
            placeholder={"Username"}
            style={styles.input}
          />
          <TextInput
            value={this.state.password1}
            onChangeText={password1 => this.setState({ password1 })}
            placeholder={"Password"}
            secureTextEntry={true}
            style={styles.input}
          />
          <TextInput
            value={this.state.password2}
            onChangeText={password2 => this.setState({ password2 })}
            placeholder={"Please repeat your password"}
            secureTextEntry={true}
            style={styles.input}
          />

          <Text style={styles.errorStatusIndicator}>{this._passwordsMatchStatus()}</Text>

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

  _passwordsMatchStatus = () => {
    if (this.state.password1 !== this.state.password2 && this.state.password1 && this.state.password2) {
      return "Paswords don't match";
    }
  };

  /**
   * Sets the visibility of modal.
   */
  _setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  _confirm = () => {
    this._registerUser(() => {
      this._setModalVisible(true);
    });
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
   * Registers user.
   *
   * Expects a response to a `register` event with an `err`. If
   * there is no `err`, runs `callback()`.
   */
  _registerUser = callback => {
    if (this.state.password1 === this.state.password2) {
      socket.emit("register", this.state.username, this.state.password1);
      socket.on("register", (_, err) => {
        if (err) return Alert.alert(failed_error, err);
        callback();
      });
    }
  };
}
