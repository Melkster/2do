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

    // initialize empty tasklist-states (unchecked/checked),
    // autofocus -false means we won't automatically focus on the textinput-fields for each task
    this.state = { listID: listID, unchecked: [], checked: [], autoFocus: false };

    // get the lists for the choosen group from DB
    socket.emit("enterListRoom", listID);

    //TODO: remove when servercode is updated
    socket.emit("getTasks", listID);
  }

  /**
   * Sets the header for the tasks screen.
   * An object with 'title' and 'headerRight' is returned.
   * The name of the list is displayed as 'title'.
   * 'headerRight' consists of the add button (to add more tasks)
   */
  static navigationOptions = ({ navigation }) => {
    title = navigation.getParam("title");
    return {
      title: title,
      // TODO: change the button to an icon
      headerRight: <Button title={"+"} onPress={navigation.getParam("addButton")} style={styles.addButton} />
    };
  };

  /**
   * Is called when the screen mounts. Turns on socket listeners.
   * Sets the correct function 'createNewTask' to be called when the
   * addButton in the header is pressed.
   */
  componentDidMount() {
    this.props.navigation.setParams({ addButton: this.createNewTask });
    socket.on("getTasks", (tasks, err) => this.handleTasks(tasks, err));
  }

  /**
   * Is called when the screen unmounts. Turns off socket listeners.
   */
  componentWillUnmount() {
    socket.off();
  }

  render() {
    /**
     * we have sections for: unchecked tasks,
     * checked tasks and one for the "add task"-option
     */
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
        data: [{ value: "Click to add a new task!" }],
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

  /**
   * Returns a TextInput-component used to display/change each tasks name.
   * There are 2 types of TextInputs that can be returned depending on the
   * section.id (if it is a checked or unchecked task).
   * 'task' is the task which will be related to that TextInput,
   * 'index' is the tasks index in the checked/unchecked list,
   * 'section' is the section where the task is (0: unchecked, 2: checked)
   */
  updateText = (task, index, section) => {
    if (section.id == 0) {
      return (
        <TextInput
          placeholder="Enter name of task"
          onChangeText={text => {
            this.state.unchecked[index].value = text;
            this.setState({ unchecked: this.state.unchecked });
          }}
          //autoFocus: if true the user automatically focus on the textinput
          autoFocus={this.state.autoFocus}
          // onSubmitEditing: gets called when you press enter
          onSubmitEditing={() => this.submitEdit(index)}
          value={this.state.unchecked[index].value}
          style={section.textstyle}
          // onBlur: gets called when you leave the text-input
          onBlur={() => {
            newName = this.state.unchecked[index].value;
            this.renameTask(task, newName);
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
          onBlur={() => {
            newName = this.state.checked[index].value;
            this.renameTask(task, newName);
          }}
        />
      );
    }
  };

  /**
   * Called when we recieve socket events from the server.
   * 'tasks' is the new list of tasks and 'err' the potential error-message.
   * We sort the received tasks since we need them seperated in checked/unchecked tasks.
   */
  handleTasks = (tasks, err) => {
    if (err) {
      console.log(err);
      return;
    }
    this.sortTasks(tasks);
  };

  /**
   * Used to sort a list of tasks into checked/unchecked tasks.
   * 'tasks' is a list of tasks.
   */
  sortTasks = tasks => {
    checkedTasks = tasks.filter(task => task.checked);
    uncheckedTasks = tasks.filter(task => !task.checked);
    this.setState({ unchecked: uncheckedTasks, checked: checkedTasks });
  };

  /**
   * Called to create a new empty task at the end of the list.
   * AutoFocus is set to 'true' which makes the cursor automatically
   * focus on the new textinput.
   */
  createNewTask = () => {
    this.setState({ autoFocus: true });
    socket.emit("addTask", this.state.listID, "");
  };

  /**
   * Toggles between the tasks states of being checked or unchecked.
   */
  toggleTask = item => {
    if (item.checked) {
      socket.emit("uncheckTask", this.state.listID, item._id);
    } else {
      socket.emit("checkTask", this.state.listID, item._id);
    }
  };

  /**
   * Called when a user press 'enter' from the textinput-field.
   * 'index' is the index of the task in the list of unchecked tasks.
   * If the textinput-field of the current task is not empty
   * - a new empty task will be created below it
   */
  submitEdit = index => {
    newName = this.state.unchecked[index].value;
    if (newName) {
      this.createNewTask();
    }
  };

  /**
   * Takes 'task' as input and deletes that task
   */
  deleteTask = task => {
    socket.emit("deleteTask", this.state.listID, task._id);
  };

  /**
   * Renames a task.
   * Takes a task 'task' and the new name 'newName'.
   * If 'newName' is empty the task will instead be deleted.
   */
  renameTask = (task, newName) => {
    if (!newName) {
      this.deleteTask(task);
      return;
    }
    listID = this.state.listID;
    taskID = task._id;
    socket.emit("editTask", listID, taskID, newName);
  };
}
