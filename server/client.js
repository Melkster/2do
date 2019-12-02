var io = require("socket.io-client");
//var socket = io.connect("http://192.168.43.229:3000");
var socket = io.connect("http://localhost:3000");
var readline = require("readline-sync");
var objectID = require("mongodb").ObjectID;

var username = "michael";
var password = "123123";
var user;
var userid;
var groupid;
var listid;

// Add a connect listener
socket.on("connect", socket => {
  console.log("Connected!");
});

socket.emit("register", username, password);
socket.on("register", (id, err) => {
    userid = id;
    console.log(id, "aaaa", userid);

  socket.emit("authenticate", username, password);
  socket.on("authenticate", (res, err) => {
      console.log(userid);

    socket.emit("createGroup", userid, "group1");
      socket.on("createGroup", (groups, err) => {
      socket.emit("createList", groups[0]._id, "list1");
      socket.on("createList", (lists, err) => {
        socket.emit("addTask", lists[0]._id, "buy milk");
        socket.emit("addTask", lists[0]._id, "buy something");
        socket.on("addTask", (tasks, err) => {
          //console.log(tasks, err);
          socket.emit("checkTask", lists[0]._id, tasks[0]._id);
        });
        socket.on("checkTask", (tasks, err) => {
          //console.log(tasks, err);
        });
      });
    });
    socket.emit("getGroups", userid);
    socket.on("getGroups", (groups, err) => {
      console.log(groups);
    });
  });
});
