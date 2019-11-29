import React, { Component } from "react";
import { Image, ScrollView, View, SectionList, Text, TouchableOpacity, Button, TextInput } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import Swipeout from "react-native-swipeout";

import Task from "./Task.js";
import groupLogo from "./assets/groupSymbol.png";
import data from "./data.json";
import styles from "./styles.js";
import checkedIcon from "./assets/checked.png";
import uncheckedIcon from "./assets/unchecked.png";

// TODO: change icon
import splash from "./assets/splash2.png";

export default class TasksScreen extends Component {
  constructor(props) {
    super(props);

    // get the tasks for the choosen list from DB, now from data.json
    listID = this.props.navigation.getParam("id");
    parentID = this.props.navigation.getParam("parentID");
    listname = "List" + parentID + listID;

    checkedTasks = data[listname].tasks.filter(task => task.checked);
    uncheckedTasks = data[listname].tasks.filter(task => !task.checked);
    this.state = { checked: checkedTasks, unchecked: uncheckedTasks, text: "" };
  }

  // set the title for the page
  static navigationOptions = ({ navigation }) => {
    listId = navigation.getParam("id");
    parentID = navigation.getParam("parentID");
    title = "List" + parentID + listId;
    return {
      title: data[title].name,
      // TODO: change the button to an icon
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButtonHeader} />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.addTask });
  }

  render() {
    return (
      <ScrollView>
        <SectionList
          sections={[
            { title: "Left", data: this.state.unchecked, icon: uncheckedIcon, style: styles.uncheckedTaskStyle }
          ]}
          renderSectionHeader={({ section }) => <Text style={styles.SectionHeaderStyle}> {section.title} </Text>}
          renderItem={({ item, section }) => (
            <Swipeout
              right={[
                {
                  text: "Delete",
                  backgroundColor: "red",
                  onPress: () => {
                    this.deleteTask(item);
                  }
                }
              ]}
              autoClose={true}
              backgroundColor="#F5F5F5"
            >
              <View style={styles.SectionListItemStyle}>
                <TouchableOpacity style={styles.checkbox} onPress={this.toggleTask.bind(this, item)}>
                  <Image source={section.icon} style={styles.SectionListImageStyle} />
                </TouchableOpacity>
                <Text style={section.style}>{item.value}</Text>
              </View>
            </Swipeout>
          )}
          keyExtractor={(item, index) => index}
        />

        <View style={styles.SectionListItemStyle}>
          <View style={styles.checkbox}>
            <Image source={splash} style={styles.SectionListImageStyle} />
          </View>
          <TextInput
            placeholder="Type here to add a task!"
            onChangeText={text => this.setState({ text })}
            value={this.state.text}
          />
        </View>
        <SectionList
          style={{ paddingTop: 30 }}
          sections={[{ title: "Done", data: this.state.checked, icon: checkedIcon, style: styles.checkedTaskStyle }]}
          renderSectionHeader={({ section }) => <Text style={styles.SectionHeaderStyle}> {section.title} </Text>}
          renderItem={({ item, section }) => (
            <Swipeout
              right={[
                {
                  text: "Delete",
                  backgroundColor: "red",
                  onPress: () => {
                    this.deleteTask(item);
                  }
                }
              ]}
              autoClose={true}
              backgroundColor="#F5F5F5"
            >
              <View style={styles.SectionListItemStyle}>
                <TouchableOpacity style={styles.checkbox} onPress={this.toggleTask.bind(this, item)}>
                  <Image source={section.icon} style={styles.SectionListImageStyle} />
                </TouchableOpacity>
                <Text style={section.style}>{item.value}</Text>
              </View>
            </Swipeout>
          )}
          keyExtractor={(item, index) => index}
        />
      </ScrollView>
    );
  }

  addTask = () => {
    // TODO: add new task
    console.log("added task");
  };

  // Change state of task and move to the other list/section (TODO: improve code)
  toggleTask = item => {
    if (item.checked) {
      this.state.unchecked.push(item);
    } else {
      this.state.checked.push(item);
    }
    this.deleteTask(item);
    // toggle the checked-value of the item
    item.checked = !item.checked;
  };

  deleteTask = item => {
    // TODO: actually remove the task from DB
    if (item.checked) {
      // filter the list of checked tasks so that all _but_ the one clicked will be left
      removeItemFromList = this.state.checked.filter(task => task.id != item.id);
      // update the state to the new list (with item removed)
      this.setState({ checked: removeItemFromList });
    } else {
      // this section does the same as above but for an unchecked task
      removeItemFromList = this.state.unchecked.filter(task => task.id != item.id);
      this.setState({ unchecked: removeItemFromList });
    }
  };
}
