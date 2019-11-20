import React, { Component } from "react";
import { Image, ScrollView, View } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import listLogo from "./assets/listSymbol.png";
import data from "./data.json";
import styles from "./styles.js"

const CellVariant = props => (
  <Cell
    cellStyle="Subtitle"
    title={props.title}
    accessory="DisclosureIndicator"
    onPress={() => {
      props.navigation.navigate("Tasks", { id: props.id, parentID: props.parentID });
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
    list = "List" + groupID;
    return (
      <ScrollView contentContainerStyle={styles.stage}>
        <TableView>
          <Section>
            {data[list].map(list => {
              title = list.name;
              id = list.id;
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
