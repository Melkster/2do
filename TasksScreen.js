import React, { Component } from "react";
import { Image, ScrollView, View } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import groupLogo from "./assets/groupSymbol.png";
import data from "./data.json"
import styles from "./styles.js"
import Checkbox from "./Checkbox.js"

const CellVariant = props => (
  <Cell
    title={props.value}
    onPress={() => {
      props.navigation.navigate("Login");
    }}
    image={<Checkbox checked={props.checked}/>}
  />
);

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
            {data[title].tasks.map(task => {
              checked = task.checked;
              if (!checked){
                value = task.value;
                id = task.id;
                return (
                  <CellVariant key={id} value={value} id={id} checked={checked} navigation={this.props.navigation} />
                );
              }
            })}
          </Section>
          <Section header="Done:">
            {data[title].tasks.map(task => {
              checked = task.checked;
              if (checked){
                value = task.value;
                id = task.id;
                return (
                  <CellVariant key={id} value={value} id={id} checked={checked} navigation={this.props.navigation} />
                );
              }
            })}
          </Section>
        </TableView>
      </ScrollView>
    );
  }
}
