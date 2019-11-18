import React, { Component } from 'react';
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
  View,
} from 'react-native';
import groupLogo from './groupSymbol.png'
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import data from './data.json';

const CellVariant = (props) => (
  <Cell
    cellStyle="Subtitle"
    title = {props.value}
    detail = {props.checked}
    accessory="DisclosureIndicator"
    onPress={() => {props.navigation.navigate('Login')}}
    image={
      <Image
        style={{ borderRadius: 5 }}
        source={groupLogo}
      />
    }
  />
);

export default class TasksScreen extends Component<{}> {
  render() {
    listId = this.props.navigation.state.params.id
    parentID = this.props.navigation.state.params.parentID
    title = "List" + parentID + listId
    console.log("Recieved title: " + title, data[title].name)
    return (
      <ScrollView contentContainerStyle={styles.stage}>
        <TableView>
          <Section header={data[title].name}>
            {data[title].tasks.map((task) => {
              value = task.value;
              checked = "Is checked: " + task.checked
              id = task.id
              return(<CellVariant key={id} value={value} id={id} checked={checked} navigation={this.props.navigation}/>)
            })}
          </Section>
        </TableView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  stage: {
    backgroundColor: '#EFEFF4',
    paddingTop: 20,
    paddingBottom: 20,
  },
});
