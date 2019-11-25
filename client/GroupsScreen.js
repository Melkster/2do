import React, { Component } from "react";
import { AsyncStorage, ScrollView, SectionList, Text, View, Button, Image, TouchableOpacity } from "react-native";

import groupLogo from "./assets/groupSymbol.png";
import data from "./data.json";
import styles from "./styles.js";

export default class GroupsScreen extends Component {
  static navigationOptions = () => {
    return{
    title: "Your groups",
    // TODO: change the button to an icon
    headerRight: <Button title={"+"} onPress={() => this.addGroup} style={styles.addButtonHeader}/>}
  };
/*
  componentDidMount() {
  this.state = { checked: checkedTasks, unchecked: uncheckedTasks };
}*/

  render() {
    // get the groups for the user _from DB_
    var groups = data.Groups;
    return (
      <View>
        <SectionList
          // we only have one section with    the users groups
        sections={[{ data: groups }]}
          // "item" corresponds to a group in the section. When clicked we navigate to the lists of that group
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.SectionListItemStyle}
              onPress={() => {
                this.props.navigation.navigate("Lists", { id: item.id, title: item.name, addButton: this.addGroup });
              }}
            >
              <Image source={groupLogo} style={styles.SectionListImageStyle} />
              <Text style={styles.SectionListTextStyle}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(group, index) => index}
        />
        <View style={styles.container}>
          <Button title="Sign me out" onPress={this._signOutAsync} />
        </View>
      </View>
    );
  }

  addGroup = () => {
    console.log("group added");
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
