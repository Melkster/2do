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
import Swipeout from "react-native-swipeout";

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
    this.state = { userID: "", groups: groups, text: "test" };
    //socket.emit("register", "1", "1");
    socket.emit("getUser", "1");
    //socket.emit("getGroups", this.state.userid);
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
    this.didFocus = this.props.navigation.addListener("didFocus", () => {
      // TODO: use "getGroups" instead when implemented
      //socket.on("register", (user, err) => this.handleRegister(user, err));
      socket.on("getUser", (user, err) => this.handleGetUser(user, err));
      socket.on("getGroups", (groups, err) => this.handleGroups(groups, err));
      socket.on("createGroup", (groups, err) => this.handleGroups(groups, err));
      socket.on("deleteGroup", (groups, err) => this.handleGroups(groups, err));
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
                <Swipeout
                  right={[
                    {
                      text: "Delete",
                      backgroundColor: "red",
                      onPress: () => {
                        groupID = item._id;
                        userID = this.state.userID;
                        socket.emit("deleteGroup", groupID, userID);
                      }
                    }
                  ]}
                  autoClose={true}
                  backgroundColor="#F5F5F5"
                >
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      // TODO: se till att rätt id skickas
                      this.props.navigation.navigate("Lists", {
                        id: item._id,
                        title: item.name,
                        userID: this.state.userID,
                        addButton: null
                      });
                    }}
                  >
                    <View style={styles.checkbox}>
                      <Image source={section.icon} style={styles.listImage} />
                    </View>
                    <Text style={styles.listText}>{item.name}</Text>
                  </TouchableOpacity>
                </Swipeout>
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
  handleError = err => {
    console.log(err);
  };

  handleRegister = (userID, err) => {
    if (err) {
      handleError(err);
      return;
    }
  };

  handleGetUser = (user, err) => {
    if (err) {
      handleError(err);
      return;
    }
    //console.log("user id: " + user._id);
    this.setState({ userID: user._id });
    socket.emit("getGroups", this.state.userID);
  };

  handleGroups = (groups, err) => {
    if (err) {
      handleError(err);
      return;
    }
    //console.log(groups);
    this.setState({ groups: groups });
  };

  createNewGroup = () => {
    socket.emit("createGroup", this.state.userID, "groupName");
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
