import React, { Component } from "react";
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

import groupIcon from "./assets/groupIcon.png";
import newGroupIcon from "./assets/newGroupIcon.png";
import data from "./data.json";
import styles from "./styles.js";

export default class GroupsScreen extends Component {
  constructor(props) {
    super(props);

    // get the groups for the user _from DB_
    var groups = data.Groups;
    this.state = { groups: groups, text: "test" };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Your groups",
      // The "add button" in the top-right corner
      // TODO: change the button to an icon
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam("addButton")} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.createNewGroup });
  }

  render() {
    return (
      <View>
        <SectionList
          // we have one section for the actual groups and one for the "add group"-option
          sections={[
            { id: 0, data: this.state.groups, icon: groupIcon },
            { id: 1, data: [{ value: "Click to add new group" }], icon: newGroupIcon }
          ]}
          // "item" corresponds to a group in the section. When clicked we navigate to the lists of that group
          renderItem={({ item, index, section }) => {
            if (section.id == 0) {
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    this.props.navigation.navigate("Lists", { id: item.id, title: item.name, addButton: null });
                  }}
                >
                  <View style={styles.checkbox}>
                    <Image source={section.icon} style={styles.listImage} />
                  </View>
                  <Text style={styles.listText}>{item.name}</Text>
                </TouchableOpacity>
              );
            } else {
              return (
                <View style={styles.addNewItem}>
                  <View style={styles.checkbox}>
                    <Image source={section.icon} style={styles.listImage} />
                  </View>
                  <TouchableOpacity onPress={this.createNewGroup}>
                    <Text style={styles.listText}>{item.value}</Text>
                  </TouchableOpacity>
                </View>
              );
            }
          }}
          keyExtractor={(group, index) => index}
        />
        <View>
          <Button title="Sign me out" onPress={this._signOutAsync} />
        </View>
      </View>
    );
  }

  createNewGroup = () => {
    //TODO: get a new group _from DB_
    newGroup = { id: 0, name: "fake-group", users: [] };
    this.state.groups.push(newGroup);
    this.setState({ groups: this.state.groups });
  };

  //TODO: remove if not used?
  enterList = list => {
    this.props.navigation.navigate("Lists", { id: list.id, title: list.name, addButton: null });
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
