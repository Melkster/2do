import React from "react";
import { ActivityIndicator, AsyncStorage, Button, StatusBar, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  static navigationOptions = {
    title: "2do sign in"
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Sign in!" onPress={this._signInAsync} />
      </View>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem("userToken", "signedIn");
    this.props.navigation.navigate("App");
  };
}
