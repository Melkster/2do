import React, { Component } from "react";
import {
  AsyncStorage,
  ScrollView,
  View,
  Button,
  Image,
  SectionList,
  ListItem,
  Text,
  TouchableOpacity
} from "react-native";
import data from "./data.json";
import styles from "./styles.js";
import checkedIcon from "./assets/checked.png";
import uncheckedIcon from "./assets/unchecked.png";

export default class Test extends Component {
  render() {
    var checked = data.List00.checkedTasks;
    var unchecked = data.List00.uncheckedTasks;

    return (
      <View>
        <SectionList
          sections={[
            { title: "Left to do", data: unchecked, icon: uncheckedIcon },
            { title: "Done", data: checked, icon: checkedIcon }
          ]}
          renderSectionHeader={({ section }) => <Text style={styles.SectionHeaderStyle}> {section.title} </Text>}
          renderItem={({ item, section }) => (
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
    console.log("item: " + item.key);
    //checked = checked.filter( task => task.id !== item.id ) ?
  };
}
