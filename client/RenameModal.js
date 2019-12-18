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
    this.state = { newName: "" };
  }

  render() {
    group = this.props.group;
    initialName = group.name;
    return (
      <Modal visible={this.props.visible} animationType={"slide"} onRequestClose={() => this.renameGroup()}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TextInput
              value={this.state.newName}
              onChangeText={newName => this.setState({ newName })}
              placeholder={group.name}
              style={styles.input}
              autoFocus={true}
            />

            <Button onPress={this.props.onSubmit(this.state.newName, group)} title="Rename" />
            <TouchableOpacity style={styles.clearButton} onPress={() => this.props.setModalVisible(false)}>
              <Text>Go back</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  renameGroup = () => {
    newName = this.state.newName;
    if (newName) {
      this.props.onSubmit("name", "group");
    } else {
      this.props.setModalVisible(false);
    }
  };
}
