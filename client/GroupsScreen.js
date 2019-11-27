import React, { Component } from "react";
import { AsyncStorage, ScrollView, SectionList, Text, View, Button, Image, TouchableOpacity } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import groupLogo from "./assets/groupSymbol.png";
import data from "./data.json";
import styles from "./styles.js";

export default class GroupsScreen extends Component {
  static navigationOptions = {
    title: "Your groups"
  };

  render() {
    // get the groups for the user _from DB_
    var groups = data.Groups;

    return (
      <View>
        <SectionList
          // we only have one section with the users groups
          sections={[{ data: groups }]}
          // "item" corresponds to a group in the section. When clicked we navigate to the lists of that group
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.SectionListItemStyle}
              onPress={() => {
                this.props.navigation.navigate("Lists", { id: item.id, title: item.name });
              }}
            >
              <Image source={groupLogo} style={styles.SectionListImageStyle} />
              <Text style={styles.SectionListTextStyle}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(group, index) => index}
        />
        <Button title="Sign me out" onPress={this._signOutAsync} />
      </View>
    );
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
