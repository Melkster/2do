import React, { Component } from "react";
import {
  Alert,
  Image,
  Button,
  Keyboard,
  Modal,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  View
} from "react-native";
import Swipeout from "react-native-swipeout";

import listIcon from "./assets/listIcon.png";
import newListIcon from "./assets/newListIcon.png";
import HeaderButton from "./CustomComponents";
import RenameModal from "./RenameModal";

import data from "./data.json";
import styles from "./styles.js";

export default class ListsScreen extends Component {
  constructor(props) {
    super(props);

    groupID = this.props.navigation.getParam("id");

    // empty lists-state before we get the lists from server
    this.state = {
      lists: [],
      groupID: groupID,
      nameEditable: false,
      inviteUsername: null,
      inviteModalVisible: false,
      renameList: null,
      renameModalVisible: false
    };
    // get the lists for the choosen group from DB
    socket.emit("enterGroupRoom", groupID);
  }

  // set the title for the page (from props)
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("title"),
      // TODO: change the button to an icon....
      headerRight: (
        <View style={styles.headerButtonContainer}>
          <HeaderButton
            title={"Invite"}
            onPress={() => {
              navigation.getParam("setModalVisible")("invite", true);
            }}
            style={styles.addButton}
          />
          <HeaderButton title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
        </View>
      )
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({
      addButton: () => this.createNewList(""),
      setModalVisible: this._setModalVisible
    });
    socket.on("getLists", (lists, err) => this.handleLists(lists, err));
    socket.on("inviteUser", err => this.handleInviteUser(err));

    this.didFocus = this.props.navigation.addListener("didFocus", () => {
      socket.on("getLists", (lists, err) => this.handleLists(lists, err));
    });
  }

  componentWillUnmount() {
    socket.on("leaveGroupRoom", this.state.groupID);
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
                          text: "Rename",
                          backgroundColor: "blue",
                          onPress: () => this.setState({ renameList: item, renameModalVisible: true })
                        },
                        {
                          text: "Delete",
                          backgroundColor: "red",
                          onPress: () => this.deleteList(item)
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
                          onBlur={() => this.renameList(item, item.name)}
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
                      <TouchableOpacity onPress={() => this.createNewList("")}>
                        <Text style={styles.listText}>{item.value}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }
              }}
              keyExtractor={(group, index) => index}
            />
            <Modal visible={this.state.inviteModalVisible} animationType={"slide"} onRequestClose={this._submit}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                  <TextInput
                    value={this.state.password}
                    onChangeText={inviteUsername => this.setState({ inviteUsername })}
                    placeholder={"Username"}
                    style={styles.input}
                    autoFocus={true}
                  />

                  <Button onPress={this._submit} title="Invite user" />
                  <TouchableOpacity style={styles.clearButton} onPress={() => this._setModalVisible("invite", false)}>
                    <Text>Go back</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
            <RenameModal
              visible={this.state.renameModalVisible}
              setModalVisible={visible => this._setModalVisible("rename", visible)}
              item={this.state.renameList}
              onSubmit={name => this.renameList(this.state.renameList, name)}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  handleLists = (lists, err) => {
    if (err) {
      console.log(err);
      return;
    }
    this.setState({ lists: lists });
  };

  handleInviteUser = err => {
    if (err) this.handleError(err);
    else {
      this._setModalVisible("invite", false);
      Alert.alert("User invited successfully");
    }
  };

  handleError = err => {
    Alert.alert(err);
  };

  _submit = () => {
    socket.emit("inviteUser", this.state.groupID, this.state.inviteUsername);
  };

  /**
   * Sets the visibility of modal.
   */
  _setModalVisible = (type, visible) => {
    if (type == "invite") {
      this.setState({ inviteModalVisible: visible });
    } else if (type == "rename") {
      this.setState({ renameModalVisible: visible });
    } else {
      err = "Modal-type does not exist";
      this.handleError(err);
    }
  };

  createNewList = name => {
    list = { name: name, _id: null };
    this.state.lists.push(list);
    this.setState({ nameEditable: true });
  };

  renameList = (list, newName) => {
    if (!newName) this.deleteList(list);
    else {
      listID = list._id;
      groupID = this.state.groupID;
      if (listID) {
        socket.emit("renameList", groupID, listID, newName);
      } else {
        socket.emit("createList", groupID, newName);
      }
    }
    this.setState({ nameEditable: false, renameModalVisible: false });
  };

  deleteList = list => {
    listID = list._id;
    if (listID) {
      this.alertDeleteList(list);
    } else {
      this.state.lists.pop();
      this.setState({ lists: this.state.lists });
    }
  };

  alertDeleteList = list => {
    listID = list._id;
    listName = list.name;
    groupID = this.state.groupID;
    Alert.alert(
      "Do you want to delete " + JSON.stringify(listName),
      "This will permanantly delete the list including all its tasks.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => socket.emit("deleteList", listID, groupID), style: "destructive" }
      ],
      { cancelable: false }
    );
  };
}
