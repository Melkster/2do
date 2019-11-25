import { StyleSheet } from "react-native";

//TODO: divide up "styles" better.
const styles = StyleSheet.create({
  stage: {
    backgroundColor: "#EFEFF4",
    paddingTop: 20,
    paddingBottom: 20
  },
  checkbox: {
    padding: 15
  },
  SectionHeaderStyle: {
    backgroundColor: "#CDDC89",
    fontSize: 20,
    padding: 5,
    color: "#fff"
  },
  SectionListItemStyle: {
    fontSize: 15,
    color: "#000",
    backgroundColor: "#F5F5F5",
    flexDirection: "row"
  },
  SectionListTextStyle: {
    flex: 1,
    padding: 15
  },
  SectionListImageStyle: {
    width: 20,
    height: 20,
    padding: 15
  },
  checkedTaskStyle: {
    textDecorationLine: "line-through",
    color: "grey"
  },
  uncheckedTaskStyle: {},
  addButtonHeaderStyle: {
    fontSize: 40,
    fontWeight: 'bold'
  }
});

export default styles;
