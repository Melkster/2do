import React, { Component } from "react";
import { Image, ScrollView, View, SectionList, Text, TouchableOpacity } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import listLogo from "./assets/listSymbol.png";
import data from "./data.json";
import styles from "./styles.js";

export default class ListsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("title")
    };
  };

  render() {
    // get the lists for the choosen group from DB
    groupID = this.props.navigation.getParam("id");
    groupname = "List" + groupID;
    lists = data[groupname];

    return (
      <View>
        <SectionList
          sections={[{ title: "Lists", data: lists }]}
          renderSectionHeader={({ section }) => <Text style={styles.SectionHeaderStyle}> {section.title} </Text>}
          //possibly add subtitle for listitem and in group (nr of tasks/members)
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.SectionListItemStyle}
              onPress={() => {
                this.props.navigation.navigate("Tasks", { id: item.id, parentID: groupID });
              }}
            >
              <Image source={listLogo} style={styles.SectionListImageStyle} />
              <Text style={styles.SectionListTextStyle}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(group, index) => index}
        />
      </View>
    );
  }
}
