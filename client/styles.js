import { StyleSheet } from "react-native";

//TO DO: divide up "styles" better.
const styles = StyleSheet.create({
  stage: {
    backgroundColor: "#EFEFF4",
    paddingTop: 20,
    paddingBottom: 20
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  input: {
    width: 200,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10
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
  uncheckedTaskStyle: {}
});

export default styles;
