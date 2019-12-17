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
    group = this.props.group;
    name = group.name;
    console.log("name: ");
    console.log(name);
    console.log("group: ");
    console.log(group);
    this.state = { newName: name, initialName: name };
  }

  render() {
    initialName = this.state.initialName;
    group = this.props.group;
    if (this.state.newName != group.name) {
      this.setState({ newName: group.name });
    }

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
