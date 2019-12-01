import { StyleSheet } from "react-native";

//TODO: divide up "styles" better.
const styles = StyleSheet.create({
  stage: {
    backgroundColor: "#EFEFF4",
    paddingTop: 20,
    paddingBottom: 20
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 10
  },
  input: {
    width: 300,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10
  },
  clearButton: {
    alignItems: "center",
    justifyContent: "center",
    margin: 10
  },
  errorStatusIndicator: {
    color: "red",
    marginBottom: 10
  },
  checkbox: {
    padding: 15
  },
  listHeader: {
    backgroundColor: "#CDDC89",
    fontSize: 20,
    padding: 5,
    color: "#fff"
  },
  listHeaderCheckedTasks: {
    backgroundColor: "#CDDC89",
    fontSize: 20,
    padding: 5,
    color: "#fff",
    marginTop: 70
  },
  listItem: {
    fontSize: 15,
    color: "#000",
    backgroundColor: "#F5F5F5",
    flexDirection: "row"
  },
  // CHANGE: lägg till en större text-ruta
  listText: {
    flex: 1,
    padding: 15,
    paddingTop: 20
  },
  listImage: {
    width: 20,
    height: 20,
    padding: 12
  },
  addButtonText: {
    fontSize: 30,
    color: "blue"
  },
  addButton: {
    marginRight: 10
  },
  checkedTask: {
    textDecorationLine: "line-through",
    color: "grey",
    padding: 20
  },
  uncheckedTask: {
    padding: 20
  },
  addNewItem: {
    fontSize: 15,
    color: "#000",
    backgroundColor: "#D3D3D3",
    flexDirection: "row"
  }
});

export default styles;
