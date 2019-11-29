var io = require("socket.io-client");
//var socket = io.connect("http://192.168.43.229:3000");
var socket = io.connect("http://localhost:3000");
var readline = require("readline-sync");
var objectID = require("mongodb").ObjectID;
// Add a connect listener
socket.on("connect", socket => {
  console.log("Connected!");
});

socket.emit("createGroup", 111, "group1");
socket.on("createGroup", (groupID, err) => {
  //socket.emit("deleteGroup", groupID);
  socket.emit("createList", groupID, "List1");
});

socket.on("createList", (listID, err) => {
  //socket.emit("deleteList", listID);
  socket.emit("addTask", listID, "task1");
  socket.emit("renameList", listID, "NEW NEW NEW LIST");
  socket.on("addTask", (taskID, err) => {
    socket.emit("editTask", listID, taskID, "NYYTTTTTT VALUE");
    // socket.emit("deleteTask", taskID);
    // socket.emit("deleteList", listID);
    //socket.emit("deleteTask", taskID);
    // socket.emit("checkTask", listID, taskID);
    // socket.on("checkTask", (taskID, err) => {
    //   console.log(taskID, err);
    //   socket.emit("uncheckTask", listID, taskID);
    // });
  });
});

socket.emit("register", "axel", "123123");
socket.emit("authenticate", "axel", "12a3");
socket.emit("authenticate", "axel", "123123");
socket.on("authenticate", (id, err) => {
  console.log(id, err);
});
