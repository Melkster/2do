import React, { Component } from "react";
import { Image, ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import checked from "./assets/checked.png";
import unchecked from "./assets/unchecked.png";
import styles from "./styles.js";

export default class Checkbox extends Component {
  render() {
    return (
      <TouchableOpacity style={styles.checkbox} onPress={this.props.handler}>
        <Image style={{ width: 20, height: 20 }} source={this.chooseImage(this.props.checked)} />
      </TouchableOpacity>
    );
  }

  chooseImage = isChecked => {
    if (isChecked) {
      return checked;
    } else {
      return unchecked;
    }
  };
}
