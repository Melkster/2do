import React from "react";
import { ActivityIndicator, AsyncStorage, Button, StatusBar, StyleSheet, View } from "react-native";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

// File imports
import AuthLoadingScreen from "./AuthLoadingScreen";
import HomeScreen from "./HomeScreen";
import OtherScreen from "./OtherScreen";
import SignInScreen from "./SignInScreen";

const AppStack = createStackNavigator({ Home: HomeScreen, Other: OtherScreen });
const AuthStack = createStackNavigator({ SignIn: SignInScreen });

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppStack,
      Auth: AuthStack
    },
    {
      initialRouteName: "AuthLoading"
    }
  )
);
