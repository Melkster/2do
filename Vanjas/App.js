import React from 'react';
import { View, Text } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import LoginScreen from './LoginScreen';
import GroupsScreen from './GroupsScreen';
import ListsScreen from './ListsScreen';
import TasksScreen from './TasksScreen';
import { YellowBox } from "react-native";

console.ignoredYellowBox = ["Remote debugger"];
YellowBox.ignoreWarnings([
    "Accessing view manager configs directly off UIManager via UIManager['getConstants'] is no longer supported. Use UIManager.getViewManagerConfig('getConstants') instead."
]);


const AppNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    Groups: GroupsScreen,
    Lists: ListsScreen,
    Tasks: TasksScreen,
  },
  {
    initialRouteName: 'Login',
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
