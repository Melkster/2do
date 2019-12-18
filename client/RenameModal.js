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
    item = this.props.item;
    if (!item) {
      return null;
    }
    initialName = item.name;
    return (
      <Modal visible={this.props.visible} animationType={"slide"} onRequestClose={() => this.renameGroup()}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TextInput
              value={this.state.newName}
              onChangeText={newName => this.setState({ newName })}
              placeholder={initialName}
              style={styles.input}
              autoFocus={true}
            />

            <Button onPress={() => this.rename()} title="Rename" />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                this.setState({ newName: "" }), this.props.setModalVisible(false);
              }}
            >
              <Text>Go back</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  rename = () => {
    newName = this.state.newName;
    this.setState({ newName: "" });
    if (newName) {
      this.props.onSubmit(newName);
    } else {
      // TODO: add an alert saying that nothing changed?
      this.props.setModalVisible(false);
    }
  };
}
