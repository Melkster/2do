var io = require("socket.io-client");
<<<<<<< HEAD
var socket = io.connect("http://192.168.43.229:3000");
=======
var socket = io.connect("http://192.168.43.254:3000");
>>>>>>> socket-connection

var readline = require("readline-sync");

// Add a connect listener
socket.on("connect", socket => {
  console.log("Connected!");
});

//var group = readline.question("what room to join: ")
///socket.emit('join group', group);
socket.on("has joined", msg => {
  console.log(msg);
});
socket.on("message", msg => {
  console.log(msg);
});

socket.on("error", msg => {
  console.log(msg);
});

socket.on("success", msg => {
  console.log(msg);
});

socket.on("groupCreated", msg => {
  console.log(msg);
});

//socket.emit('chat message', readline.question("any message to the group? "), group);
socket.emit("createGroup", "1000", "100");
// socket.emit("addTask", "100", "100", readline.question("what task to add? "));
socket.emit("authenticate", "", "melkersuger");
