import React, { Component } from "react";
import { Image, ScrollView, View } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import listLogo from "./assets/listSymbol.png";
import data from "./data.json";
import styles from "./styles.js"

const CellVariant = props => (
  <Cell
    cellStyle="Subtitle"
    title={props.list.name}
    accessory="DisclosureIndicator"
    onPress={() => {
      props.navigation.navigate("Tasks", { id: props.list.id, parentID: props.parentID });
    }}
    image={<Image style={{ borderRadius: 5 }} source={listLogo} />}
  />
);

export default class ListsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
      return {
        title: navigation.getParam('title'),
      };
    };

  render() {
    groupID = this.props.navigation.getParam('id');
    listname = "List" + groupID;
    return (
      <ScrollView contentContainerStyle={styles.stage}>
        <TableView>
          <Section>
            {data[listname].map(list => {
              return (
                <CellVariant key={list.id} list={list} parentID={groupID} navigation={this.props.navigation} />
              );
            })}
          </Section>
        </TableView>
      </ScrollView>
    );
  }
}
