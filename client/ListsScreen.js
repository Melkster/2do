import React, { Component } from "react";
import { Image, Button, ScrollView, View, SectionList, Text, TouchableOpacity } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";

import listLogo from "./assets/listSymbol.png";
import splash from "./assets/splash.png";

import data from "./data.json";
import styles from "./styles.js";

export default class ListsScreen extends Component {
  // set the title for the page (from props)
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("title"),
      // TODO: change the button to an icon....
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.addList });
  }

  render() {
    // get the lists for the choosen group from DB
    groupID = this.props.navigation.getParam("id");
    groupname = "List" + groupID;
    lists = data[groupname];

    return (
      <View>
        <SectionList
          sections={[
            {
              id: 0,
              title: "Lists",
              data: lists,
              icon: listLogo,
              header: <Text style={styles.listHeader}> Lists </Text>
            },
            {
              id: 1,
              title: null,
              data: [{ value: "Click to add new list" }],
              icon: splash,
              header: null
            }
          ]}
          renderSectionHeader={({ section }) => section.header}
          //possibly add subtitle for listitem and in group (nr of tasks/members)
          renderItem={({ item, section }) => {
            if (section.id == 0) {
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    this.props.navigation.navigate("Tasks", { id: item.id, parentID: groupID, addButton: null });
                  }}
                >
                  <Image source={listLogo} style={styles.listImage} />
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
      </View>
    );
  }

  addList = () => {
    console.log("add list");
  };
}
