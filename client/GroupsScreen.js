import React, { Component } from "react";
import {
  Alert,
  AsyncStorage,
  ScrollView,
  SectionList,
  Text,
  View,
  Button,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from "react-native";
import Swipeout from "react-native-swipeout";

import groupIcon from "./assets/groupIcon.png";
import newGroupIcon from "./assets/newGroupIcon.png";
import plusIcon from "./assets/plusIcon.png";

import data from "./data.json";
import styles from "./styles";
import HeaderButton from "./CustomComponents";
import RenameModal from "./RenameModal";

export default class GroupsScreen extends Component {
  constructor(props) {
    super(props);
    //TODO: remove
    const fakeGroup = { _id: 0, name: fakeGroup };
    this.state = { userID: "", groups: [], nameEditable: false, viewRenameModal: false, renameGroup: fakeGroup };

    //gets userID (from saved usertoken) and then all the users groups
    this.getUser();
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Your groups",
      // The "add button" in the top-right corner
      // TODO: change the button to an icon
      headerRight: (
        <View style={styles.headerButtonContainer}>
          <HeaderButton title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
        </View>
      )
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.createNewGroup });
    socket.on("getGroups", (groups, err) => this.handleGroups(groups, err));
    this.didFocus = this.props.navigation.addListener("didFocus", () => {
      socket.on("getGroups", (groups, err) => this.handleGroups(groups, err));
    });
  }

  componentWillUnmount() {
    socket.off();
    this.didFocus.remove();
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
        behavior="padding"
        enabled
        keyboardVerticalOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
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
                          text: "Rename",
                          backgroundColor: "blue",
                          onPress: () => this.setState({ viewRenameModal: true, renameGroup: item })
                        },
                        {
                          text: "Delete",
                          backgroundColor: "red",
                          onPress: () => this.deleteGroup(item)
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
                            userID: this.state.userID
                            //addButton: null
                          });
                        }}
                      >
                        <View style={styles.checkbox}>
                          <Image source={section.icon} style={styles.listImage} />
                        </View>
                        <TextInput
                          placeholder="Enter name of group"
                          onChangeText={text => {
                            this.state.groups[index].name = text;
                            this.setState({ groups: this.state.groups });
                          }}
                          value={this.state.groups[index].name}
                          style={styles.listTextInput}
                          editable={this.state.nameEditable}
                          pointerEvents="none"
                          autoFocus={true}
                          // onBlur is called when the user finishes writing in the textinput
                          onBlur={() => this.renameGroup(item, index)}
                        />
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
            <View style={{ margin: 40 }}>
              <Button title="Sign me out" onPress={this._signOutAsync} />
            </View>
            <RenameModal
              visible={this.state.viewRenameModal}
              group={this.state.renameGroup}
              onSubmit={(newName, group) => this.newName}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  handleError = err => {
    Alert.alert(err);
  };

  handleGroups = (groups, err) => {
    if (err) {
      this.handleError(err);
      return;
    }

    this.setState({ groups: groups });
  };

  getUser = async () => {
    const userID = await AsyncStorage.getItem("userToken");
    this.setState({ userID });
    socket.emit("getGroups", userID);
  };

  renameGroup = (group, index) => {
    newName = this.state.groups[index].name;
    if (!newName) {
      this.deleteGroup(group);
      return;
    }
    groupID = group._id;
    userID = this.state.userID;
    socket.emit("renameGroup", groupID, userID, newName);
    this.setState({ nameEditable: false });
  };

  newName = (newName, group) => {
    console.log("New name given");
    console.log(newName);
    console.log(group);
    this.setState({ viewRenameModal: false });
  };

  deleteGroup = group => {
    groupID = group._id;
    userID = this.state.userID;
    socket.emit("deleteGroup", groupID, userID);
  };

  createNewGroup = () => {
    this.setState({ nameEditable: true });
    socket.emit("createGroup", this.state.userID, "");
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
