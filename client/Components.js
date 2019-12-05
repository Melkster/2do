import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  AsyncStorage,
  ScrollView,
  SectionList,
  Text,
  View,
  Button,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableHighlight
} from "react-native";

import styles from "./styles.js";

export default class HeaderButton extends Component {
  static propTypes = {
    title: PropTypes.string
  };

  render() {
    return (
      <View style={styles.headerButton}>
        <Button title={this.props.title} />
      </View>
    );
  }
}
