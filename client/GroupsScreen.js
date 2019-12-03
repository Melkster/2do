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
import plusIcon from "./assets/plusIcon.png";

import data from "./data.json";
import styles from "./styles.js";

export default class GroupsScreen extends Component {
  constructor(props) {
    super(props);

    // get the groups for the user _from DB_
    var groups = [];
    this.state = { username: "1", userid: "", groups: groups, text: "test" };
    socket.emit("register", "1", "1");
    socket.emit("getUser", this.state.username);
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
    // TODO: use "getGroups" instead when implemented
    socket.on("getUser", (user, err) => this.handleGetUser(user, err));
    socket.on("createGroup", (groupID, err) => this.handleCreateGroup(groupID, err));
  }

  componentWillUnmount() {
    socket.off();
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
              // this is the section for all lists
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    // TODO: se till att rätt id skickas
                    this.props.navigation.navigate("Lists", { id: item, userid: this.state.userid, addButton: null });
                  }}
                >
                  <View style={styles.checkbox}>
                    <Image source={section.icon} style={styles.listImage} />
                  </View>
                  <Text style={styles.listText}>{item}</Text>
                </TouchableOpacity>
              );
            } else {
              // this is the section of the "add a new list" item
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

  handleGetUser = (user, err) => {
    if (err) {
      console.log(err);
      return;
    }
    this.setState({ groups: user.groups, userid: user.id });
  };

  createNewGroup = () => {
    console.log("createar ny grupp");
    socket.emit("createGroup", this.state.userid, "group");
  };

  handleCreateGroup = (groupID, err) => {
    if (err) {
      console.log(err);
      return;
    }
    // TODO: make sure the right thing is added to state (not just ID)
    console.log("pushar nytt id");
    this.state.groups.push(groupID);
    this.setState({ groups: this.state.groups });
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
