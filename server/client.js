var io = require("socket.io-client");
//var socket = io.connect("http://192.168.43.229:3000");
var socket = io.connect("http://localhost:3000");
var readline = require("readline-sync");
var objectID = require("mongodb").ObjectID;
// Add a connect listener
socket.on("connect", socket => {
  console.log("Connected!");
});

//var group = readline.question("what room to join: ")
///socket.emit('join group', group);
// socket.on("has joined", msg => {
//   console.log(msg);
// });
// socket.on("message", msg => {
//   console.log(msg);
// });

// socket.on("error", msg => {
//   console.log(msg);
// });

// socket.on("success", msg => {
//   console.log(msg);
// });

// socket.on("groupCreated", msg => {
//   console.log(msg);
// });

// socket.on("register", userid => {
//   console.log(userid);
// });

// socket.on("authenticate", res => {
//   console.log(res);
// });
//socket.emit('chat message', readline.question("any message to the group? "), group);
//socket.emit("createGroup", "1000", "100");
// socket.emit("addTask", "100", "100", readline.question("what task to add? "));
//socket.emit("authenticate", "", "melkersuger");
//socket.emit("register", "asdasdasd", "1111");
//socket.emit("authenticate", "asdasdasd", "1111");
//socket.emit("authenticate", "asdasdasd", "22222");

socket.emit("createGroup", 111, 11);
socket.on("createGroup", (groupID, err) => {
  console.log(typeof groupID);
  var groupID2 = new objectID(groupID);
  console.log(typeof groupID2);
  socket.emit("createList", groupID2, "BABBABABABA");
});

socket.on("createList", (listID, err) => {
  socket.emit("addTask", listID, "ASSDASDAS");
});
