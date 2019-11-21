import React, { Component } from "react";
import {
  ActivityIndicator,
  AppRegistry,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import groupLogo from "./assets/groupSymbol.png";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import data from "./data.json";
import styles from "./styles";

const CellVariant = props => (
  <Cell
    cellStyle="Subtitle"
    title={props.title}
    accessory="DisclosureIndicator"
    onPress={() => {
      props.navigation.navigate("Tasks", { id: props.id, parentID: props.parentID });
    }}
    image={<Image style={{ borderRadius: 5 }} source={groupLogo} />}
  />
);

export default class ListsScreen extends Component {
  render() {
    groupID = this.props.navigation.state.params.id;
    title = this.props.navigation.state.params.title;
    list = "List" + groupID;
    return (
      <ScrollView contentContainerStyle={styles.stage}>
        <TableView>
          <Section header={title}>
            {data[list].map(list => {
              title = list.name;
              //tasks = "Tasks: " + list.tasks.length;
              id = list.id;
              console.log("title: " + title, "id: " + id);
              console.log("group id: " + groupID);
              return (
                <CellVariant key={id} id={id} parentID={groupID} title={title} navigation={this.props.navigation} />
              );
            })}
          </Section>
        </TableView>
      </ScrollView>
    );
  }
}
