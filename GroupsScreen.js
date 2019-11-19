import React, { Component } from "react";
import {
  ActivityIndicator,
  AppRegistry,
  AsyncStorage,
  Button,
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

const styles = StyleSheet.create({
  stage: {
    backgroundColor: "#EFEFF4",
    paddingTop: 20,
    paddingBottom: 20
  }
});

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
    title: "2Do"
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.stage}>
        <TableView>
          <Section header="Groups">
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
