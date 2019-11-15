import React from "react";
import { ActivityIndicator, AsyncStorage, Button, StatusBar, StyleSheet, View } from "react-native";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

// File imports
import { AuthLoadingScreen } from "./AuthLoadingScreen.js";
import { HomeScreen } from "./HomeScreen.js";
import { OtherScreen } from "./OtherScreen.js";
import { SignInScreen } from "./SignInScreen.js";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

const AppStack = createStackNavigator({ Home: HomeScreen, Other: OtherScreen });
const AuthStack = createStackNavigator({ SignIn: SignInScreen });

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: "AuthLoading",
    }
  )
);
