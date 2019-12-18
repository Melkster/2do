import "react-native";
import React from "react";
import CreateAccountScreen from "../CreateAccountScreen";

import renderer from "react-test-renderer";

it("renders correctly", () => {
  const tree = renderer.create(<CreateAccountScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
