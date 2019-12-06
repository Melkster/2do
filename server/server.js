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
  // Database setup: Creates an index on username and makes it unique
  database.collection("users").createIndex({ name: 1 }, { unique: true });
  //connection event i recieved every time a new user connects to server

  io.on("connection", socket => {
    console.log("A user connected");
    // Event that gets called when user navigates to a list, this joines a socket room
    // which gets updated everytime any member of the room makes a change
    // remove listID in print later
    socket.on("enterListRoom", async listID => {
      socket.join(listID);
      io.in(listID).emit("joined", "new user here");
      try {
        var tasks = await dbfunc.getTasks(database, new objectID(listID));
        socket.emit("getTasks", tasks, null);
      } catch (e) {
        socket.emit("getTasks", null, e);
        console.log(e);
      }
    });

    socket.on("leaveListRoom", async listID => {
      try {
        socket.leave(listID);
        socket.emit("leaveListRoom", null);
      } catch (e) {
        socket.emit("leaveListRoom", e);
      }
    });

    socket.on("enterGroupRoom", async groupID => {
      socket.join(groupID);
      try {
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        socket.emit("getLists", lists, null);
      } catch (e) {
        socket.emit("getLists", null, e);
        console.log(e);
      }
    });

    socket.on("leaveGroupRoom", async groupID => {
      try {
        socket.leave(groupID);
        socket.emit("leaveGroupRoom", null);
      } catch (e) {
        socket.emit("leaveListRoom", e);
      }
    });
    // Not used for now
    // TODO: groupID in print later
    socket.on("joinGroup", groupID => {
      var id = groupID;
      socket.join(id);
      io.in(id).emit("has joined", "A user has joined the group-room: " + groupID);
    });

    // Returns all lists in a group given a groupID
    socket.on("getLists", async groupID => {
      try {
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        socket.emit("getLists", lists, null);
      } catch (e) {
        socket.emit("getLists", null, "Could not get lists");
        console.log(e);
      }
    });

    // TODO: Use rooms later when that is implemented correctly
    // Adds tasks to a list, returns the list of all tasks after the task is added
    socket.on("addTask", async (listID, value) => {
      try {
        var taskID = await dbfunc.addTask(database, new objectID(listID), value);
        var tasks = await dbfunc.getTasks(database, new objectID(listID));
        io.in(listID).emit("getTasks", tasks, null);
      } catch (e) {
        socket.emit("getTasks", null, e);
        console.log(e);
      }
    });

    // Creates new list in a group, returns a list of all the lists
    // in the group after the new list id added
    socket.on("createList", async (groupID, value) => {
      try {
        var objgroupID = new objectID(groupID);
        var listID = await dbfunc.createList(database, objgroupID, value);
        var lists = await dbfunc.getLists(database, objgroupID);
        socket.emit("getLists", lists, null);
      } catch (e) {
        socket.emit("getLists", null, "could not create list");
        console.log(e);
      }
    });

    // Creates a new group given a name.
    // Returns all name and ID for all groups that a user belongs to
    socket.on("createGroup", async (userID, groupName) => {
      try {
        var groupID = await dbfunc.createGroup(database, new objectID(userID), groupName);
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        socket.emit("getGroups", groups, null);
      } catch (e) {
        console.log(e);
        socket.emit("getGroups", null, "Could not create group");
      }
    });

    // Checks a task in a list, given listID and taskID.
    // Returns the list of all tasks in the list after the check is made.
    socket.on("checkTask", async (listID, taskID) => {
      try {
        var objListID = new objectID(listID);
        await dbfunc.checkTask(database, objListID, new objectID(taskID));
        var tasks = await dbfunc.getTasks(database, objListID);
        io.in(listID).emit("getTasks", tasks, null);
      } catch (e) {
        socket.emit("getTasks", null, "Could not check task");
        console.log(e);
      }
    });

    // Unchecks a task in a list given listID and taskID
    // Returns the list of all tasks in the list after the uncheck is made
    socket.on("uncheckTask", async (listID, taskID) => {
      try {
        await dbfunc.uncheckTask(database, new objectID(listID), new objectID(taskID));
        var tasks = await dbfunc.getTasks(database, new objectID(listID));
        //.in(listID)

        io.in(listID).emit("getTasks", tasks, null);
      } catch (e) {
        socket.emit("getTasks", null, "Could not uncheck task");
        console.log(e);
      }
    });

    // Deletes a task in a list given listID and taskID
    // Returns the list of all tasks in the list after the delete is made
    socket.on("deleteTask", async (listID, taskID) => {
      try {
        await dbfunc.deleteTask(database, new objectID(taskID));
        //.in(listID)
        var tasks = await dbfunc.getTasks(database, new objectID(listID));

        io.in(listID).emit("getTasks", tasks, null);
      } catch (e) {
        socket.emit("getTasks", null, "Could not delete task");
        console.log(e);
      }
    });

    // Deletes a list in a group given a listID and a groupID
    // Return a list of all list in the group after the deleteion is made
    socket.on("deleteList", async (listID, groupID) => {
      try {
        await dbfunc.deleteList(database, new objectID(listID));
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        socket.emit("getLists", lists, null);
      } catch (e) {
        socket.emit("getLists", null, "Could not delete list");
        console.log(e);
      }
    });

    // Deletes a group given the groupID
    // Returns the list of groups for the user given userID
    socket.on("deleteGroup", async (groupID, userID) => {
      try {
        await dbfunc.deleteGroup(database, new objectID(groupID));
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        socket.emit("getGroups", groups, null);
      } catch (e) {
        socket.emit("getGroups", null, "Could not delete Group");
        console.log(e);
      }
    });

    // Edits a task given the taskID and a new value
    // returns the list of all tasks in the list after the edit is made.
    socket.on("editTask", async (listID, taskID, value) => {
      try {
        var objListID = new objectID(listID);
        await dbfunc.editTask(database, objListID, new objectID(taskID), value);
        var tasks = await dbfunc.getTasks(database, objListID);
        io.in(listID).emit("getTasks", tasks, null);
      } catch (e) {
        socket.emit("getTasks", null, "Could not edit task");
        console.log(e);
      }
    });

    // Renames a list given a listID and value
    // Returns the list of lists given a groupID after the edit is made
    socket.on("renameList", async (groupID, listID, value) => {
      try {
        await dbfunc.renameList(database, new objectID(listID), value);
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        socket.emit("getLists", lists, null);
      } catch (e) {
        socket.emit("getLists", null, "Could not rename list");
        console.log(e);
      }
    });

    // Renames group given a groupID and a new value
    // TODO return the list of groups in a user after the rename is made.
    socket.on("renameGroup", async (groupID, userID, value) => {
      try {
        await dbfunc.renameGroup(database, new objectID(groupID), value);
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        socket.emit("getGroups", groups, null);
      } catch (e) {
        socket.emit("getGroups", null, "Could not rename group");
        console.log(e);
      }
    });

    // Register a user with a name and password
    // TODO: use real databse instead of mock
    socket.on("register", async (username, password) => {
      if (!username) {
        socket.emit("register", null, "missing username");
      } else if (!password) {
        socket.emit("register", null, "missing password");
      } else {
        try {
          var passwordHash = await hash_password(password);
          var userID = await dbfunc.registerUser(database, username, passwordHash);
          socket.emit("register", userID, null);
        } catch (e) {
          socket.emit("register", null, e);
          console.log(e);
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
        socket.emit("authenticate", null, "missing username");
      } else if (!password) {
        socket.emit("authenticate", null, "missing password");
      } else {
        try {
          var user = await dbfunc.getUser(database, username);
          if (user) {
            if (await authenticate(username, password)) {
              delete user.passwordHash;
              socket.emit("authenticate", user, null);
            } else {
              socket.emit("authenticate", null, "incorrect password");
            }
          } else {
            socket.emit("authenticate", null, "User does not exist");
          }
        } catch (e) {
          socket.emit("authenticate", null, "User does not exist");
          console.log(e);
        }
      }
    });

    // Invites a new user to a group given the userID of the user and the groupID of the group
    socket.on("inviteUser", async (groupID, username) => {
      try {
        await dbfunc.inviteUser(database, new objectID(groupID), username);
        socket.emit("inviteUser", null);
      } catch (e) {
        console.log(e);
        socket.emit("inviteUser", "Could not invite user");
      }
    });

    // removes a user from a group given groupID and userID
    socket.on("leaveGroup", async (groupID, userID) => {
      try {
        await dbfunc.leaveGroup(database, new objectID(groupID), new objectID(userID));
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        socket.emit("getGroups", groups, null);
      } catch (e) {
        console.log(e);
        socket.emit("getGroups", null, "Could not leave group");
      }
    });

    // Returns the user as represented in the database
    socket.on("getUser", async username => {
      try {
        var user = await dbfunc.getUser(database, username);
        if (user) {
          socket.emit("getUser", user, null);
        } else {
          socket.emit("getUser", user, "A user with that name does not exist");
        }
      } catch (e) {
        console.log(e);
        socket.emit("getUser", null, "Could not get user");
      }
    });

    // Returns all lists given a groupID
    socket.on("getLists", async groupID => {
      try {
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        socket.emit("getLists", lists, null);
      } catch (e) {
        console.log(e);
        socket.emit("getLists", null, "Could not get lists");
      }
    });

    // Returns a list of the tasks in a list given the listID
    socket.on("getTasks", async listID => {
      try {
        var tasks = await dbfunc.getTasks(database, new objectID(listID));
        io.in(listID).emit("getTasks", tasks, null);
      } catch (e) {
        console.log(e);
        socket.emit("getTasks", null, "Could not get tasks");
      }
    });

    // Returns list of groups that a user belongs to, given username
    socket.on("getGroups", async userID => {
      try {
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        socket.emit("getGroups", groups, null);
      } catch (e) {
        console.log(e);
        socket.emit("getGroups", null, e);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
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
