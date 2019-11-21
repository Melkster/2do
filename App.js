import React from "react";
import { ActivityIndicator, AsyncStorage, Button, StatusBar, StyleSheet, View } from "react-native";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

// File imports
import AuthLoadingScreen from "./AuthLoadingScreen";
import GroupsScreen from "./GroupsScreen";
import ListsScreen from "./ListsScreen";
import LogInScreen from "./LogInScreen";
import TasksScreen from "./TasksScreen";

const AppStack = createStackNavigator({ Groups: GroupsScreen, Lists: ListsScreen, Tasks: TasksScreen });
const AuthStack = createStackNavigator({ LogIn: LogInScreen });

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
