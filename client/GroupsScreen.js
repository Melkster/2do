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

import groupLogo from "./assets/groupSymbol.png";
import splash from "./assets/splash.png";
import data from "./data.json";
import styles from "./styles.js";

export default class GroupsScreen extends Component {
  constructor(props) {
    super(props);

    // get the groups for the user _from DB_
    var groups = data.Groups;
    this.state = { modalVisible: false, groups: groups, text: "" };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Your groups",
      // TODO: change the button to an icon
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.addGroup });
  }

  render() {
    return (
      <View>
        <Modal animationType="slide" visible={this.state.modalVisible}>
          <View style={{ alignItems: "center", paddingTop: 100 }}>
            <TextInput
              placeholderTextColor={"grey"}
              placeholder={"Name of the group"}
              onChangeText={text => this.setState({ text: text })}
              value={this.state.text}
              style={styles.uncheckedTask}
            />
            <Button
              title={"Create"}
              onPress={() => {
                this.createNewGroup();
              }}
            ></Button>
          </View>
        </Modal>
        <SectionList
          // we only have one section with the users groups
          sections={[
            { id: 0, data: this.state.groups, icon: groupLogo },
            { id: 1, data: [{ value: "Click to add new group" }], icon: splash }
          ]}
          // "item" corresponds to a group in the section. When clicked we navigate to the lists of that group
          renderItem={({ item, index, section }) => {
            if (section.id == 0) {
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    this.props.navigation.navigate("Lists", { id: item.id, title: item.name, addButton: null });
                  }}
                >
                  <Image source={groupLogo} style={styles.listImage} />
                  <Text style={styles.listText}>{item.name}</Text>
                </TouchableOpacity>
              );
            } else {
              return (
                <View style={styles.listItem}>
                  <View style={styles.checkbox}>
                    <Image source={section.icon} style={styles.listImage} />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      this.setModalVisibility(true);
                    }}
                  >
                    <Text style={styles.addNewTask}>{item.value}</Text>
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

  setModalVisibility(visible) {
    this.setState({ modalVisible: visible });
  }

  createNewGroup() {
    //TODO: get a new group _from DB_
    id = Math.floor(Math.random() * 100) + 1;
    newGroup = { id: id, name: this.state.text, users: [] };

    this.state.groups.push(newGroup);
    this.setState({ text: "" });
    this.setModalVisibility(false);
  }

  addGroup = () => {
    //TODO: add a new group
    //this.state.checked.push(item);
    console.log("group added");

    this.state.unchecked.push(newTask);
    unchecked = this.state.unchecked;
    this.setState({ unchecked: unchecked });
  };

  enterList = list => {
    this.props.navigation.navigate("Lists", { id: list.id, title: list.name, addButton: null });
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
