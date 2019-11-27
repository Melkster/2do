import React, { Component } from "react";
import { AsyncStorage, ScrollView, SectionList, Text, View, Button, Image, TouchableOpacity } from "react-native";

import groupLogo from "./assets/groupSymbol.png";
import splash from "./assets/splash.png";
import data from "./data.json";
import styles from "./styles.js";

export default class GroupsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Your groups",
      // TODO: change the button to an icon
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.addGroup });
  }

  render() {
    // get the groups for the user _from DB_
    var groups = data.Groups;

    return (
      <View>
        <SectionList
          // we only have one section with the users groups
          sections={[
            { id: 0, data: groups, icon: groupLogo },
            { id: 1, data: [{ value: "Click to add new group" }], icon: splash }
          ]}
          // "item" corresponds to a group in the section. When clicked we navigate to the lists of that group
          renderItem={({ item, section }) => {
            if (section.id == 0) {
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    this.props.navigation.navigate("Lists", { id: item.id, title: item.name, addButton: null });
                  }}
                >
                  <Image source={groupLogo} style={styles.listImage} />
                  <Text style={styles.listText}>{item.name}</Text>
                </TouchableOpacity>
              );
            } else {
              return (
                <View style={styles.listItem}>
                  <View style={styles.checkbox}>
                    <Image source={section.icon} style={styles.listImage} />
                  </View>
                  <TouchableOpacity onPress={this.createNewTask}>
                    <Text style={styles.addNewTask}>{item.value}</Text>
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

  addGroup = () => {
    //TODO: add a new group
    //this.state.checked.push(item);
    console.log("group added");
  };

  enterList = list => {
    this.props.navigation.navigate("Lists", { id: list.id, title: list.name, addButton: null });
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
