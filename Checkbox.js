import React, { Component } from "react";
import { Image, ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import checked from "./assets/checked.png";
import unchecked from "./assets/unchecked.png";
import styles from "./styles.js";

export default class Checkbox extends Component {
  constructor(props) {
    super(props);
    console.log("state: "+ props.checked)
    this.state = {checked: props.checked};
  }

  render() {
    return (
      <TouchableOpacity style={{padding: 15}} onPress={() => {this.setState({checked: !this.state.checked})}}>
      <Image style={{width: 20, height: 20}} source={this.chooseImage(this.state.checked)} />
      </TouchableOpacity>);
  }

  chooseImage = (isChecked) => {
    if (isChecked) {
      return(checked)
    } else {
      return (unchecked)
    }

  };
}
