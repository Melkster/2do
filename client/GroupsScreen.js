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
  RefreshControl,
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

    this.state = {
      userID: "",
      groups: [],
      nameEditable: false,
      refreshing: false,
      modalVisible: false,
      renameGroup: null
    };

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
    this.props.navigation.setParams({ addButton: () => this.createNewGroup("") });
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
        <ScrollView
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}
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
                            onPress: () => this.setState({ renameGroup: item, modalVisible: true })
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
                            onBlur={() => this.renameGroup(item, item.name)}
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
                        <TouchableOpacity onPress={() => this.createNewGroup("")}>
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
                visible={this.state.modalVisible}
                setModalVisible={bool => this.setModalVisible(bool)}
                item={this.state.renameGroup}
                onSubmit={name => this.renameGroup(this.state.renameGroup, name)}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  handleError = err => {
    Alert.alert(err);
  };

  handleGroups = (groups, err) => {
    if (err) this.handleError(err);
    else this.setState({ groups: groups, refreshing: false });
  };

  handleRefresh = () => {
    this.setState({ refreshing: true });
    socket.emit("getGroups", this.state.userID);
    this.setState({ refreshing: false });
  };

  getUser = async () => {
    const userID = await AsyncStorage.getItem("userToken");
    this.setState({ userID });
    socket.emit("getGroups", userID);
  };

  renameGroup = (group, newName) => {
    if (!newName) this.deleteGroup(group);
    else {
      groupID = group._id;
      userID = this.state.userID;
      if (groupID) {
        socket.emit("renameGroup", groupID, userID, newName);
      } else {
        socket.emit("createGroup", userID, newName);
      }
    }
    this.setState({ nameEditable: false, modalVisible: false });
  };

  setModalVisible = bool => {
    this.setState({ modalVisible: bool });
  };

  deleteGroup = group => {
    groupID = group._id;
    if (groupID) {
      this.alertDeleteGroup(group);
    } else {
      this.state.groups.pop();
      this.setState({ groups: this.state.groups });
    }
  };

  alertDeleteGroup = group => {
    groupID = group._id;
    groupName = group.name;
    userID = this.state.userID;
    Alert.alert(
      "Do you want to delete " + JSON.stringify(groupName),
      "This will permanantly delete the group including all its lists and tasks.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => socket.emit("deleteGroup", groupID, userID), style: "destructive" }
      ],
      { cancelable: false }
    );
  };

  /**
   * Called to create a new group locally at the end of the list.
   */
  createNewGroup = name => {
    group = { name: name, _id: null };
    this.state.groups.push(group);
    this.setState({ nameEditable: true });
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
