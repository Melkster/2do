import React, { Component } from "react";
import { Image, ScrollView, View, SectionList, Text, TouchableOpacity } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import Task from "./Task.js";
import groupLogo from "./assets/groupSymbol.png";
import data from "./data.json";
import styles from "./styles.js";
import checkedIcon from "./assets/checked.png";
import uncheckedIcon from "./assets/unchecked.png";

export default class TasksScreen extends Component {
  constructor(props) {
    super(props);

    // get the tasks for the choosen list from DB
    listID = this.props.navigation.getParam("id");
    parentID = this.props.navigation.getParam("parentID");
    listname = "List" + parentID + listID;
    checkedTasks = data[listname].tasks.filter(task => task.checked);
    uncheckedTasks = data[listname].tasks.filter(task => !task.checked);
    console.log(checkedTasks + uncheckedTasks);
    this.state = { checked: checkedTasks, unchecked: uncheckedTasks };
  }

  static navigationOptions = ({ navigation }) => {
    listId = navigation.getParam("id");
    parentID = navigation.getParam("parentID");
    title = "List" + parentID + listId;
    return {
      title: data[title].name
    };
  };

  render() {
    return (
      <View>
        <SectionList
          sections={[
            { title: "Left", data: this.state.unchecked, icon: uncheckedIcon },
            { title: "Done", data: this.state.checked, icon: checkedIcon }
          ]}
          renderSectionHeader={({ section }) => <Text style={styles.SectionHeaderStyle}> {section.title} </Text>}
          renderItem={({ item, index, section }) => (
            <View style={styles.SectionListItemStyle}>
              <TouchableOpacity style={styles.checkbox} onPress={this.GetSectionListItem.bind(this, item)}>
                <Image source={section.icon} style={styles.SectionListImageStyle} />
              </TouchableOpacity>
              <Text style={styles.SectionListTextStyle}>{item.value}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }

  // Change state of task and move to the other list/section
  GetSectionListItem = item => {
    if (item.checked) {
      removeItemFromList = this.state.checked.filter(task => task.id != item.id);
      this.state.unchecked.push(item);
      this.setState({
        checked: removeItemFromList
      });
    } else {
      removeItemFromList = this.state.unchecked.filter(task => task.id != item.id);
      this.state.checked.push(item);
      this.setState({
        unchecked: removeItemFromList
      });
    }
    item.checked = !item.checked;
  };
}
