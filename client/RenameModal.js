import React, { Component } from "react";
import {
  Modal,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  View
} from "react-native";
import styles from "./styles";

export default class RenameModal extends Component {
  constructor(props) {
    super(props);
    name = this.props.group.name;
    this.state = { newName: name };
  }

  render() {
    group = this.props.group;
    initialName = group.name;
    console.log(initialName);

    return (
      <Modal
        visible={this.props.visible}
        animationType={"slide"}
        onRequestClose={this.props.onSubmit(this.state.newName, group)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TextInput
              value={this.state.newName}
              onChangeText={newName => this.setState({ newName })}
              placeholder={"New name"}
              style={styles.input}
              autoFocus={true}
            />

            <Button onPress={this.props.onSubmit(this.state.newName, group)} title="Rename" />
            <TouchableOpacity style={styles.clearButton} onPress={() => this.props.onSubmit(initialName, group)}>
              <Text>Go back</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}
