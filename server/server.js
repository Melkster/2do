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

//Connect to databse
mongo.connect(url, { useUnifiedTopology: true }, async function(err, db) {
  var database = db.db("mydb");
  //connection event i recieved every time a new user connects to server
  io.on("connection", socket => {
    console.log("A user connected");
    // Event that gets called when user navigates to a list, this joines a socket room
    // which gets updated everytime any member of the room makes a change
    // remove listID in print later
    socket.on("enterListRoom", listID => {
      var id = listID;
      socket.join(id);
      //console.log("user has joined room: " + listID);
      //.in(id)
      io.emit("enterListRoom", "A user has joined the list-room: " + listID);
    });

    // Not used for now
    // TODO: groupID in print later
    socket.on("joinGroup", groupID => {
      var id = groupID;
      socket.join(id);
      console.log(id);
      io.in(id).emit("has joined", "A user has joined the group-room: " + groupID);
    });

    socket.on("getLists", async groupID => {
      try {
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        io.emit("getLists", lists, null);
      } catch (e) {
        io.emit("getLists", null, "Could not get lists");
        console.log(e);
      }
    });

    // Use rooms later when that is implemented correctly
    socket.on("addTask", async (listID, value) => {
      try {
        var taskID = await dbfunc.addTask(database, new objectID(listID), value);
        //.in(listID)
        io.emit("addTask", taskID, null);
      } catch (e) {
        io.emit("addTask", null, "could not add task");
        console.log(e);
      }
    });

    socket.on("createList", async (groupID, value) => {
      try {
        var listID = await dbfunc.createList(database, new objectID(groupID), value);
        io.emit("createList", listID, null);
      } catch (e) {
        io.emit("createList", null, "could not create list");
        console.log(e);
      }
    });

    socket.on("createGroup", async (userID, groupName) => {
      try {
        var groupID = await dbfunc.createGroup(database, new objectID(userID), groupName);
        io.emit("createGroup", groupID, null);
      } catch (e) {
        console.log(e);
        io.emit("createGroup", null, "Could not create group");
      }
    });

    socket.on("checkTask", async (listID, taskID) => {
      try {
        await dbfunc.checkTask(database, new objectID(listID), new objectID(taskID));
        //.in(listID)
        io.emit("checkTask", taskID, null);
      } catch (e) {
        io.emit("checkTask", null, "Could not check task");
        console.log(e);
      }
    });

    socket.on("uncheckTask", async (listID, taskID) => {
      try {
        dbfunc.uncheckTask(database, new objectID(listID), new objectID(taskID));
        //.in(listID)
        io.emit("uncheckTask", taskID, null);
      } catch (e) {
        io.emit("uncheckTask", null, "Could not uncheck task");
        console.log(e);
      }
    });

    socket.on("deleteTask", async (listID, taskID) => {
      try {
        await dbfunc.deleteTask(database, new objectID(taskID));
        //.in(listID)
        io.emit("deleteTask", true, null);
      } catch (e) {
        io.emit("deleteTask", null, "Could not delete task");
        console.log(e);
      }
    });

    socket.on("deleteList", async listID => {
      try {
        await dbfunc.deleteList(database, new objectID(listID));
        io.emit("deleteList", true, null);
      } catch (e) {
        io.emit("deleteList", null, "Could not delete list");
        console.log(e);
      }
    });

    socket.on("deleteGroup", async groupID => {
      try {
        await dbfunc.deleteGroup(database, new objectID(groupID));
        io.emit("deleteGroup", true, null);
      } catch (e) {
        io.emit("deleteGroup", null, "Could not delete Group");
        console.log(e);
      }
    });

    // Emit changes to rooms instead on only back
    socket.on("editTask", async (listID, taskID, value) => {
      try {
        await dbfunc.editTask(database, new objectID(listID), new objectID(taskID), value);
        //.in(listID)
        io.emit("editTask", taskID, null);
      } catch (e) {
        io.emit("editTask", null, "Could not edit task");
        console.log(e);
      }
    });

    socket.on("renameList", async (listID, value) => {
      try {
        await dbfunc.renameList(database, new objectID(listID), value);
        io.emit("renameList", listID, null);
      } catch (e) {
        io.emit("renameTask", null, "Could not rename list");
        console.log(e);
      }
    });

    socket.on("renameGroup", async (groupID, value) => {
      try {
        await dbfunc.renameGroup(database, new objectID(groupID), value);
        io.emit("renameGroup", groupID, null);
      } catch (e) {
        io.emit("renameGroup", null, "Could not rename group");
        console.log(e);
      }
    });

    // Register a user with a name and password
    // TODO: use real databse instead of mock
    socket.on("register", async (username, password) => {
      if (!username) {
        io.emit("register", null, "missing username");
      } else if (!password) {
        io.emit("register", null, "missing password");
      } else {
        if (!(await dbfunc.getUser(database, username))) {
          try {
            var passwordHash = await hash_password(password);
            var userID = await dbfunc.registerUser(database, username, passwordHash);
            io.emit("register", userID, null);
          } catch (e) {
            io.emit("register", null, "could not register user");
            console.log(e);
          }
        } else {
          io.emit("register", null, "a user with that name already exist");
        }
      }
    });

    // Authenticate event sent when login on client, the authenticate function
    // is used to check the password compared to the one in database
    //
    // returns authenticate event with an error message if error occured and null if successfull
    // TODO: use real database instead of mock
    socket.on("authenticate", async (username, password) => {
      if (!username) {
        io.emit("authenticate", null, "missing username");
      } else if (!password) {
        io.emit("authenticate", null, "missing password");
      } else {
        try {
          var res = await authenticate(username, password);
          var user = await dbfunc.getUser(database, username);
          if (res) {
            io.emit("authenticate", user, null);
          } else {
            io.emit("authenticate", null, "Autentication failed");
          }
        } catch (e) {
          console.log(e);
        }
      }
    });

    socket.on("inviteUser", async (groupID, userID) => {
      try {
        await dbfunc.inviteUser(database, new objectID(groupID), new objectID(userID));
        io.emit("inviteUser", true, null);
      } catch (e) {
        console.log(e);
        io.emit("inviteUser", null, "Could not invite user");
      }
    });

    socket.on("leaveGroup", async (groupID, userID) => {
      try {
        dbfunc.leaveGroup(database, new objectID(groupID), new objectID(userID));
        io.emit("leaveGroup", groupID, null);
      } catch (e) {
        console.log(e);
        io.emit("leaveGroup", null, "Could not leave group");
      }
    });

    socket.on("getUser", async username => {
      try {
        var user = await dbfunc.getUser(database, username);
        if (user) {
          io.emit("getUser", user, null);
        } else {
          io.emit("getUser", user, "A user with that name does not exist");
        }
      } catch (e) {
        console.log(e);
        io.emit("getUser", null, "Could not getUser");
      }
    });

    socket.on("getTasks", async listID => {
      var tasks = await dbfunc.getTasks(database, new objectID(listID));
      io.emit("getTasks", tasks, null);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });

    // Used only for debug purposes
    // TODO: remove later
    socket.on("chatMessage", (msg, group) => {
      io.in(group).emit("message", msg);
      console.log("Message: ", msg);
    });

    // Some functions for authentication and password hash management
    async function hash_password(password) {
      const hash3 = await bcrypt.hashSync(password, salt);
      return hash3;
    }

    async function compare_passwords(passwordhash, password) {
      const res = await bcrypt.compareSync(password, passwordhash);
      return res;
    }

    async function authenticate(username, password) {
      var user = await dbfunc.getUser(database, username);
      if (!user) {
        console.log("no user with that name");
        return false;
      } else {
        return compare_passwords(user.passwordHash, password);
      }
    }
  });
  db.close();
});

http.listen(3000, "0.0.0.0", () => {
  console.log("Listening on localhost: 3000");
});
