import React, { Component } from "react";
import { Image, ScrollView, View, SectionList, Text, TextInput, TouchableOpacity, Button } from "react-native";
//import { Cell, Section, TableView } from "react-native-tableview-simple";
import Swipeout from "react-native-swipeout";

import data from "./data.json";
import styles from "./styles.js";
import checkedIcon from "./assets/checked.png";
import uncheckedIcon from "./assets/unchecked.png";
import newTaskIcon from "./assets/newTaskIcon.png";

export default class TasksScreen extends Component {
  constructor(props) {
    super(props);
    listID = this.props.navigation.getParam("id");
    // initialize empty tasklist-states (unchecked/checked)
    this.state = { listID: listID, unchecked: [], checked: [] };
    // get the lists for the choosen group from DB
    socket.emit("enterListRoom", listID);

    //TODO: remove when servercode is updated
    socket.emit("getTasks", listID);
  }

  // set the title for the page
  static navigationOptions = ({ navigation }) => {
    title = navigation.getParam("title");
    return {
      title: title,
      // TODO: change the button to an icon
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.createNewTask });
    socket.on("getTasks", (tasks, err) => this.handleTasks(tasks, err));
  }

  componentWillUnmount() {
    socket.off();
  }

  render() {
    // we have sections for: unchecked tasks, checked tasks and one for the "add task"-option
    sections = [
      {
        id: 0,
        title: "Left",
        data: this.state.unchecked,
        icon: uncheckedIcon,
        textstyle: styles.listTextInput,
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
        header: <Text style={styles.listHeader}> Done </Text>
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
          placeholder="Enter name of task"
          onChangeText={text => {
            this.state.unchecked[index].value = text;
            this.setState({ unchecked: this.state.unchecked });
          }}
          autoFocus={true}
          value={this.state.unchecked[index].value}
          style={section.textstyle}
          // TODO: onBlur -> update task name in DB
          onBlur={() => {
            newName = this.state.unchecked[index].value;
            this.updateTask(item, newName);
          }}
        />
      );
    } else {
      return (
        <TextInput
          placeholder="Enter name of task"
          onChangeText={text => {
            this.state.checked[index].value = text;
            this.setState({ checked: this.state.checked });
          }}
          value={this.state.checked[index].value}
          style={section.textstyle}
          // TODO: onBlur -> update task name in DB

          onBlur={() => {
            newName = this.state.checked[index].value;
            this.updateTask(item, newName);
          }}
        />
      );
    }
  };

  sortTasks = tasks => {
    checkedTasks = tasks.filter(task => task.checked);
    uncheckedTasks = tasks.filter(task => !task.checked);
    this.setState({ unchecked: uncheckedTasks, checked: checkedTasks });
  };

  handleTasks = (tasks, err) => {
    if (err) {
      console.log(err);
      return;
    }
    this.sortTasks(tasks);
  };

  createNewTask = () => {
    socket.emit("addTask", this.state.listID, "");
  };

  // Change state of task and move to the other list/section (TODO: improve code)
  toggleTask = item => {
    if (item.checked) {
      socket.emit("uncheckTask", this.state.listID, item._id);
    } else {
      socket.emit("checkTask", this.state.listID, item._id);
    }
  };

  deleteTask = item => {
    socket.emit("deleteTask", this.state.listID, item._id);
  };

  updateTask = (task, newName) => {
    listID = this.state.listID;
    taskID = task._id;
    socket.emit("editTask", listID, taskID, newName);
  };
}
