import React, { Component } from "react";
import { Image, Button, ScrollView, View, SectionList, Text, TextInput, TouchableOpacity } from "react-native";
import Swipeout from "react-native-swipeout";

import listIcon from "./assets/listIcon.png";
import newListIcon from "./assets/newListIcon.png";

import data from "./data.json";
import styles from "./styles.js";

export default class ListsScreen extends Component {
  constructor(props) {
    super(props);

    // get the lists for the choosen group from DB, now from data.json
    groupID = this.props.navigation.getParam("id");
    groupname = "List" + groupID;
    lists = data[groupname];

    // check if the group exist (TODO: fix this code when connected to DB)
    if (!lists) {
      lists = [];
    }
    this.state = { lists: lists };
  }

  // set the title for the page (from props)
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("title"),
      // TODO: change the button to an icon....
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.createNewList });
  }

  render() {
    return (
      <View>
        <SectionList
          // we have one section for the actual lists and one for the "add list"-option
          sections={[
            {
              id: 0,
              title: "Lists",
              data: this.state.lists,
              icon: listIcon,
              header: <Text style={styles.listHeader}> Lists </Text>
            },
            {
              id: 1,
              title: null,
              data: [{ value: "Click to add new list" }],
              icon: newListIcon,
              header: null
            }
          ]}
          renderSectionHeader={({ section }) => section.header}
          //possibly add subtitle for listitem and in group (nr of tasks/members)
          renderItem={({ item, index, section }) => {
            if (section.id == 0) {
              return (
                <Swipeout
                  right={[
                    {
                      text: "Delete",
                      backgroundColor: "red",
                      onPress: () => {
                        this.deleteList(item);
                      }
                    }
                  ]}
                  autoClose={true}
                  backgroundColor="#F5F5F5"
                >
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      this.props.navigation.navigate("Tasks", { id: item.id, parentID: groupID, addButton: null });
                    }}
                  >
                    <View style={styles.checkbox}>
                      <Image source={section.icon} style={styles.listImage} />
                    </View>
                    <TextInput
                      onChangeText={text => {
                        this.state.lists[index].name = text;
                        this.setState({ lists: this.state.lists });
                      }}
                      value={this.state.lists[index].name}
                      style={styles.uncheckedTask}
                      // TODO: onBlur -> update task name in DB
                      onBlur={() => {
                        console.log("update list name");
                      }}
                    />
                  </TouchableOpacity>
                </Swipeout>
              );
            } else {
              return (
                <View style={styles.addNewItem}>
                  <View style={styles.checkbox}>
                    <Image source={section.icon} style={styles.listImage} />
                  </View>
                  <TouchableOpacity onPress={this.createNewList}>
                    <Text style={styles.listText}>{item.value}</Text>
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

  createNewList = () => {
    //TODO: get a new list _from DB_ with empty task object.
    newList = { id: -1, name: "" };

    this.state.lists.push(newList);
    this.setState({ lists: this.state.lists });
  };

  deleteList = item => {
    // TODO: add a warning that all tasks will be deleted?
    listDeleted = this.state.lists.filter(list => list.id != item.id);
    this.setState({ lists: listDeleted });
  };
}
