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

    groupID = this.props.navigation.getParam("id");
    // empty lists-state before we get the lists from server
    this.state = { lists: [], groupID: groupID, nameEditable: false };
    // get the lists for the choosen group from DB
    socket.emit("getLists", groupID);
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
    socket.on("getLists", (lists, err) => this.handleLists(lists, err));

    this.didFocus = this.props.navigation.addListener("didFocus", () => {
      socket.on("getLists", (lists, err) => this.handleLists(lists, err));
    });
  }

  componentWillUnmount() {
    socket.off();
    this.didFocus.remove();
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
                        groupID = this.state.groupID;
                        listID = item._id;
                        socket.emit("deleteList", listID, groupID);
                      }
                    }
                  ]}
                  autoClose={true}
                  backgroundColor="#F5F5F5"
                >
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      this.props.navigation.navigate("Tasks", { id: item._id, title: item.name });
                    }}
                  >
                    <View style={styles.checkbox}>
                      <Image source={section.icon} style={styles.listImage} />
                    </View>
                    <TextInput
                      placeholder="Enter name of list"
                      onChangeText={text => {
                        this.state.lists[index].name = text;
                        this.setState({ lists: this.state.lists });
                      }}
                      editable={this.state.nameEditable}
                      pointerEvents="none"
                      autoFocus={true}
                      value={this.state.lists[index].name}
                      style={styles.listTextInput}
                      // TODO: onBlur -> update task name in DB
                      onBlur={() => {
                        groupID = this.state.groupID;
                        listID = item._id;
                        newName = this.state.lists[index].name;
                        socket.emit("renameList", groupID, listID, newName);
                        this.setState({ nameEditable: false });
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

  handleLists = (lists, err) => {
    if (err) {
      console.log(err);
      return;
    }
    this.setState({ lists: lists });
  };

  createNewList = () => {
    this.setState({ nameEditable: true });
    socket.emit("createList", this.state.groupID, "");
  };

  deleteList = item => {
    // TODO: add a warning that all tasks will be deleted?
    listDeleted = this.state.lists.filter(list => list.id != item.id);
    this.setState({ lists: listDeleted });
  };
}
