import React, {Component} from "react";
import { AsyncStorage, ScrollView, View, Button, Image } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import groupLogo from "./assets/groupSymbol.png";
import data from "./data.json";

// styles are undefined atm for some reason :/
import styles from "./styles.js"


const CellVariant = props => (
  <Cell
    cellStyle="Subtitle"
    title={props.title}
    detail={props.members}
    accessory="DisclosureIndicator"
    onPress={() => {
      props.navigation.navigate("Lists", { id: props.id, title: props.title });
    }}
    image={<Image style={{ borderRadius: 5 }} source={groupLogo} />}
  />
);

export default class GroupsScreen extends Component {
  static navigationOptions = {
    title: "Your groups"
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.stage}>
        <TableView>
          <Section>
            {data.Groups.map(group => {
              title = group.name;
              members = "Members: " + group.users.length;
              id = group.id;
              return (
                <CellVariant key={id} title={title} id={id} members={members} navigation={this.props.navigation} />
              );
            })}
          </Section>
        </TableView>
        <View style={styles.container}>
          <Button title="Sign me out" onPress={this._signOutAsync} />
        </View>
      </ScrollView>
    );
  }

  _showMoreApp = () => {
    this.props.navigation.navigate("Other");
  };

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };
}
