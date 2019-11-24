import React, { Component } from "react";
import groupLogo from "./assets/groupSymbol.png";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import data from "./data.json";
import Checkbox from "./Checkbox.js";

export default class Task extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = { checked: props.task.checked };
    this.handler = this.handler.bind(this);
  }

  render() {
    task = this.props.task;
    return <Cell title={task.value} image={<Checkbox checked={this.state.checked} handler={this.handler} />} />;
  }

  handler() {
    console.log("changed state");
    this.setState({
      checked: !this.state.checked
    });
    this.props.handler;
  }
}
