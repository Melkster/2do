import React, { Component } from "react";
import { Image, ScrollView, View, SectionList, Text, TextInput, TouchableOpacity, Button } from "react-native";
//import { Cell, Section, TableView } from "react-native-tableview-simple";
import Swipeout from "react-native-swipeout";

import data from "./data.json";
import styles from "./styles.js";
import checkedIcon from "./assets/checked.png";
import uncheckedIcon from "./assets/unchecked.png";
import newTaskIcon from "./assets/newTaskIcon.png";

// TODO: used before the database (this can be removed later)
fakeLists = ["List99", "List88", "List89", "List98"];

export default class TasksScreen extends Component {
  constructor(props) {
    super(props);

    // get the tasks for the choosen list from DB, now from data.json
    listID = this.props.navigation.getParam("id");
    parentID = this.props.navigation.getParam("parentID");
    listname = "List" + parentID + listID;
    if (listID == -1) {
      checkedTasks = [];
      uncheckedTasks = [];
    } else {
      checkedTasks = data[listname].tasks.filter(task => task.checked);
      uncheckedTasks = data[listname].tasks.filter(task => !task.checked);
    }
    this.state = { unchecked: uncheckedTasks, checked: checkedTasks };
  }

  // set the title for the page
  static navigationOptions = ({ navigation }) => {
    listId = navigation.getParam("id");
    parentID = navigation.getParam("parentID");
    listname = "List" + parentID + listId;

    if (listname in fakeLists) {
      title = data[title].name;
    } else {
      title = "unknown list";
    }
    return {
      title: title,
      // TODO: change the button to an icon
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.createNewTask });
  }

  render() {
    // we have sections for: unchecked tasks, checked tasks and one for the "add task"-option
    sections = [
      {
        id: 0,
        title: "Left",
        data: this.state.unchecked,
        icon: uncheckedIcon,
        textstyle: styles.uncheckedTask,
        header: <Text style={styles.listHeader}> Left </Text>
      },
      {
        id: 1,
        title: null,
        data: [{ value: "Type here to add a task!" }],
        icon: newTaskIcon,
        textstyle: styles.addNewTask,
        header: null
      },
      {
        id: 2,
        title: "Done",
        data: this.state.checked,
        icon: checkedIcon,
        textstyle: styles.checkedTask,
        header: <Text style={styles.listHeaderCheckedTasks}> Done </Text>
      }
    ];

    return (
      <View>
        <SectionList
          sections={sections}
          renderSectionHeader={({ section }) => section.header}
          renderItem={({ item, index, section }) => {
            if (section.title) {
              return (
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
                  <View style={styles.listItem}>
                    <TouchableOpacity style={styles.checkbox} onPress={this.toggleTask.bind(this, item)}>
                      <Image source={section.icon} style={styles.listImage} />
                    </TouchableOpacity>
                    {this.updateText(item, index, section)}
                  </View>
                </Swipeout>
              );
            } else {
              return (
                <View style={styles.addNewItem}>
                  <View style={styles.checkbox}>
                    <Image source={section.icon} style={styles.listImage} />
                  </View>
                  <TouchableOpacity onPress={this.createNewTask}>
                    <Text style={styles.listText}>{item.value}</Text>
                  </TouchableOpacity>
                </View>
              );
            }
          }}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }

  // TODO: TextInput component should cover most of the item (easier to click)
  // Try to optimize code using "checked"/"unchecked"
  updateText = (item, index, section) => {
    if (section.id == 0) {
      return (
        <TextInput
          onChangeText={text => {
            this.state.unchecked[index].value = text;
            this.setState({ unchecked: this.state.unchecked });
          }}
          value={this.state.unchecked[index].value}
          style={section.textstyle}
          // TODO: onBlur -> update task name in DB
          onBlur={() => {
            console.log("update task name");
          }}
        />
      );
    } else {
      return (
        <TextInput
          onChangeText={text => {
            this.state.checked[index].value = text;
            this.setState({ checked: this.state.checked });
          }}
          value={this.state.checked[index].value}
          style={section.textstyle}
          // TODO: onBlur -> update task name in DB
          onBlur={() => {
            console.log("update task name");
          }}
        />
      );
    }
  };

  createNewTask = () => {
    //TODO: get a new task _from DB_
    id = Math.floor(Math.random() * 100) + 1;
    newTask = { id: id, value: "", checked: false };

    this.state.unchecked.push(newTask);
    unchecked = this.state.unchecked;
    this.setState({ unchecked: unchecked });
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
