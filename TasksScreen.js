import React, { Component } from "react";
import { Image, ScrollView, View } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import Task from "./Task.js"
import groupLogo from "./assets/groupSymbol.png";
import data from "./data.json"
import styles from "./styles.js"


export default class TasksScreen extends Component {
  static navigationOptions = ({ navigation }) => {
      listId = navigation.getParam('id');
      parentID = navigation.getParam('parentID');
      title = "List" + parentID + listId;
      return {
        title: data[title].name,
      };
    };

  render() {
    listId = this.props.navigation.getParam('id');
    parentID = this.props.navigation.getParam('parentID');
    title = "List" + parentID + listId;
    return (
      <ScrollView contentContainerStyle={styles.stage}>
        <TableView>
          <Section header="Tasks left:">
            {data[title].tasks.filter(task => (!task.checked)).map(task => {
              return(
              <Task key={task.id} task={task}/>
            );}
          )}
          </Section>
          <Section header="Done:">
          {data[title].tasks.filter(task => (task.checked)).map(task => {
            return(
              <Task key={task.id} task={task}/>
          );}
        )}
          </Section>
        </TableView>
      </ScrollView>
    );
  }
}
