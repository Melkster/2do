// TODO: try catch statements for all the events
// database functions export
// rewrite with real database functions

const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

var mongo = require("mongodb").MongoClient;
var objectID = require("mongodb").ObjectID;
var url = "mongodb://localhost:27017/data/db";

var dbfunc = require("./db");
//var database = new db();

//console.log(typeof db.createGroup);
var users = [
  {
    name: "foo",
    passwordhash: "aa"
  },
  {
    name: "michael",
    passwordhash: "bb"
  },
  {
    name: "axel",
    passwordhash: "cc"
  },
  {
    name: "vanja",
    passwordhash: "dd"
  }
];

//Connect to databse
mongo.connect(url, { useUnifiedTopology: true }, async function(err, db) {
  var database = db.db("mydb");
  //var x = await dbfunc.createGroup(database, "5", "Grupp 8");
  //var y = await dbfunc.createGroup(database, "5", "Grupp 1");
  // var id1 = dbfunc.createList(database, x, "aaaa");
  // var id2 = dbfunc.createList(database, x, "bbbb");
  // var id3 = dbfunc.addTask(database, x, id2, "mat");
  // var id4 = dbfunc.addTask(database, x, id2, "mera");
  // var id5 = dbfunc.addTask(database, x, id1, "annat");

  //connection event i recieved every time a new user connects to server
  io.on("connection", socket => {
    console.log("A user connected");

    // Authenticate event sent when login on client, the authenticate function
    // is used to check the password compared to the one in database
    //
    // returns authenticate event with an error message if error occured and null if successfull
    // TODO: use real database instead of mock
    socket.on("authenticate", (username, password) => {
      console.log("authenticate", username, password);
      if (!username) {
        io.emit("authenticate", null, "missing username");
      } else if (!password) {
        io.emit("authenticate", null, "missing password");
      } else {
        (async () => {
          try {
            var res = await authenticate(username, password);
            var userid = 1337; // MOCK
            if (res) {
              io.emit("authenticate", userid, null);
            } else {
              io.emit("authenticate", null, "Autentication failed");
            }
          } catch (e) {
            console.log(e);
          }
        })();
      }
    });

    // Register a user with a name and password
    // TODO: use real databse instead of mock
    socket.on("register", (username, password) => {
      console.log("user reg", username, password);
      if (!username) {
        io.emit("error", "missing username");
      } else if (!password) {
        io.emit("error", "missing password");
      } else {
        var userid = 1;
        users.push({ name: username, password: "" });
        (async () => {
          await hash_password(username, password);
          io.emit("register", userid);
        })();
      }
    });

    // Event that gets called when user navigates to a list, this joines a socket room
    // which gets updated everytime any member of the room makes a change
    socket.on("enterListRoom", listID => {
      socket.join(listID);
      console.log(listID);
      io.in(listID).emit("enterListRoom", "A user has joined the list-room: " + listID);
    });

    // Not used for now
    // TODO: remove if we decide to not use this at all
    socket.on("joinGroup", groupID => {
      socket.join(groupID);
      console.log(groupID);
      io.in(groupID).emit("has joined", "A user has joined the group-room: " + groupID);
    });

    // Used only for debug purposes
    // TODO: remove later
    socket.on("chatMessage", (msg, group) => {
      io.in(group).emit("message", msg);
      console.log("Message: ", msg);
    });

    socket.on("getGroups", () => {
      //TODO: return list of groups for a user
      try {
        io.emit("getGroups", 1);
      } catch (e) {
        console.log(e);
      }
    });

    //----------------------------------------------------------

    socket.on("getLists", groupID => {
      try {
        io.emit("getLists", 1);
      } catch (e) {
        console.log(e);
      }
      //TODO: return list of lists for a group
    });

    socket.on("deleteTask", taskID => {
      try {
        dbfunc.deleteTask(database, taskID);
        io.emit("deleteTask", true);
      } catch (e) {
        console.log(e);
      }
      //TODO: remove task from database
    });

    socket.on("deleteList", listID => {
      try {
        dbfunc.deleteList(database, listID);
        io.emit("deleteList", true);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("deleteGroup", groupID => {
      //TODO: delete group from database
      (async () => {
        try {
          dbfunc.deleteGroup(database, groupID);
          io.emit("deleteGroup", true);
        } catch (e) {
          console.log(e);
        }
      })();
    });

    socket.on("addTask", (groupID, listID, value) => {
      var taskID = dbfunc.addTask(database, groupID, listID, value);
      err = true;
      if (err) {
        console.log("could not insert into database");
        io.emit("error", "could not insert into database");
      } else {
        console.log("succesfull");
        io.in(listID).emit("successful add", taskID);
      }
    });

    socket.on("createList", (groupID, value) => {
      //TODO: Add list to database
      (async () => {
        try {
          var listID = dbfunc.createList(database, groupID, value);
          io.emit("createList", listID);
        } catch (e) {
          console.log(e);
        }
      })();
    });

    socket.on("createGroup", (userID, groupName) => {
      (async () => {
        try {
          var groupID = await dbfunc.createGroup(database, userID, groupName);
          console.log(groupID);
          io.emit("createGroup", groupID);
        } catch (e) {
          console.log(e);
          io.emit("error", e);
        }
      })();
    });

    socket.on("checkTask", (listID, taskID, userID) => {
      //TODO: check a task given an ID
      dbfunc.checkTask(listID, taskID, userID);
      io.emit("checkTask", taskID);
    });

    socket.on("uncheckTask", (listID, taskID, userID) => {
      //TODO: uncheck a task given an
      dbfunc.uncheckTask(listID, taskID, userID);
      io.emit("uncheckTask", taskID);
    });

    socket.on("renameTask", (listID, taskID, userID, value) => {
      //TODO: Edit a task given and ID and new value
      dbfunc.renameTask(listID, taskID, value);
      io.emit("renameTask", taskID);
    });

    socket.on("renameList", (groupID, listID, value) => {
      //TODO: Edit a list given and ID and new value
      dbfunc.renameList(groupID, listID, value);
      io.emit("renameList", listID);
    });

    socket.on("renameGroup", (groupID, value) => {
      //TODO: Edit a group given and ID and new value
      dbfunc.renameGroup(groupID, value);
      io.emit("renameGroup", groupID);
    });

    socket.on("inviteUser", (groupID, userID) => {
      //TODO: invite user to group
    });

    socket.on("leaveGroup", (groupID, userID) => {
      //TODO: remove user from group, check if sucessfull
      dbfunc.leaveGroup(groupID, userID);
      io.emit("leaveGroup", true);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });

    async function hash_password(user, password) {
      const hash3 = await bcrypt.hash(password, salt);
      user = users.find(x => x.name == user);
      user["passwordhash"] = hash3;
      //TODO: change to return hashed password and then send call the register function in dbfunc
    }

    async function compare_passwords(passwordhash, password) {
      const res = await bcrypt.compare(password, passwordhash);
      return res;
    }

    async function authenticate(username, password) {
      //TODO: change to database, use getUser func to aquire password hash
      // should return userid so authentication function can emit it to user on login
      const found = await users.find(x => x.name == username);
      if (!found) {
        console.log("user does not exist");
        return false;
      } else {
        const res = await compare_passwords(found["passwordhash"], password);
        return res;
      }
    }
  });
  db.close();
});

http.listen(3000, "0.0.0.0", () => {
  console.log("Listening on localhost: 3000");
});
