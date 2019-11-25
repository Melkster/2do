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
          sections={[{ data: groups }]}
          // comment
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
        <View style={styles.container}>
          <Button title="Sign me out" onPress={this._signOutAsync} />
        </View>
      </View>
    );
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
