// __tests__/Login-page-test.js
import "react-native";
import React from "react";
import GroupsScreen from "../LogInScreen";
import socket from "../socket";

import renderer from "react-test-renderer";

it("renders correctly", () => {
  const tree = renderer.create(<GroupsScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
