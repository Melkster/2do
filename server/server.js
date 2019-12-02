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

    // Returns all lists in a group given a groupID
    socket.on("getLists", async groupID => {
      try {
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        io.emit("getLists", lists, null);
      } catch (e) {
        io.emit("getLists", null, "Could not get lists");
        console.log(e);
      }
    });

    // TODO: Use rooms later when that is implemented correctly
    // Adds tasks to a list, returns the list of all tasks after the task is added
    socket.on("addTask", async (listID, value) => {
      try {
        var objListID = new objectID(listID);
        var taskID = await dbfunc.addTask(database, objListID, value);
        var tasks = await dbfunc.getTasks(database, objListID);
        //.in(listID)
        io.emit("addTask", tasks, null);
      } catch (e) {
        io.emit("addTask", null, "could not add task");
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
        io.emit("createList", lists, null);
      } catch (e) {
        io.emit("createList", null, "could not create list");
        console.log(e);
      }
    });

    // Creates a new group given a name.
    // Returns all name and ID for all groups that a user belongs to
    socket.on("createGroup", async (userID, groupName) => {
      try {
        console.log(userID, groupName);
        var groupID = await dbfunc.createGroup(database, new objectID(userID), groupName);
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        console.log(groups);
        io.emit("createGroup", groups, null);
      } catch (e) {
        console.log(e);
        io.emit("createGroup", null, "Could not create group");
      }
    });

    // Checks a task in a list, given listID and taskID.
    // Returns the list of all tasks in the list after the check is made.
    socket.on("checkTask", async (listID, taskID) => {
      try {
        var objListID = new objectID(listID);
        await dbfunc.checkTask(database, objListID, new objectID(taskID));
        var tasks = await dbfunc.getTasks(database, objListID);
        //.in(listID)
        io.emit("checkTask", tasks, null);
      } catch (e) {
        io.emit("checkTask", null, "Could not check task");
        console.log(e);
      }
    });

    // Unchecks a task in a list given listID and taskID
    // Returns the list of all tasks in the list after the uncheck is made
    socket.on("uncheckTask", async (listID, taskID) => {
      try {
        dbfunc.uncheckTask(database, new objectID(listID), new objectID(taskID));
        var tasks = await dbfunc.getTasks(database, new objectID(listID));
        //.in(listID)
        io.emit("uncheckTask", tasks, null);
      } catch (e) {
        io.emit("uncheckTask", null, "Could not uncheck task");
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
        io.emit("deleteTask", tasks, null);
      } catch (e) {
        io.emit("deleteTask", null, "Could not delete task");
        console.log(e);
      }
    });

    // Deletes a list in a group given a listID and a groupID
    // Return a list of all list in the group after the deleteion is made
    socket.on("deleteList", async (listID, groupID) => {
      try {
        await dbfunc.deleteList(database, new objectID(listID));
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        io.emit("deleteList", lists, null);
      } catch (e) {
        io.emit("deleteList", null, "Could not delete list");
        console.log(e);
      }
    });

    // Deletes a group given the groupID
    // Returns the list of groups for the user given userID
    socket.on("deleteGroup", async (groupID, userID) => {
      try {
        await dbfunc.deleteGroup(database, new objectID(groupID));
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        io.emit("deleteGroup", groups, null);
      } catch (e) {
        io.emit("deleteGroup", null, "Could not delete Group");
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
        //.in(listID)
        io.emit("editTask", tasks, null);
      } catch (e) {
        io.emit("editTask", null, "Could not edit task");
        console.log(e);
      }
    });

    // Renames a list given a listID and value
    // Returns the list of lists given a groupID after the edit is made
    socket.on("renameList", async (groupID, listID, value) => {
      try {
        await dbfunc.renameList(database, new objectID(listID), value);
        var lists = await dbfunc.getLists(database, new objectID(groupID));
        io.emit("renameList", lists, null);
      } catch (e) {
        io.emit("renameTask", null, "Could not rename list");
        console.log(e);
      }
    });

    // Renames group given a groupID and a new value
    // TODO return the list of groups in a user after the rename is made.
    socket.on("renameGroup", async (groupID, userID, value) => {
      try {
        await dbfunc.renameGroup(database, new objectID(groupID), value);
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        io.emit("renameGroup", groups, null);
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
            delete user.passwordHash;
            io.emit("authenticate", user, null);
          } else {
            io.emit("authenticate", null, "Authentication failed");
          }
        } catch (e) {
          console.log(e);
        }
      }
    });

    // Invites a new user to a group given the userID of the user and the groupID of the group
    socket.on("inviteUser", async (groupID, userID) => {
      try {
        await dbfunc.inviteUser(database, new objectID(groupID), new objectID(userID));
        io.emit("inviteUser", true, null);
      } catch (e) {
        console.log(e);
        io.emit("inviteUser", null, "Could not invite user");
      }
    });

    // removes a user from a group given groupID and userID
    socket.on("leaveGroup", async (groupID, userID) => {
      try {
        dbfunc.leaveGroup(database, new objectID(groupID), new objectID(userID));
        io.emit("leaveGroup", groupID, null);
      } catch (e) {
        console.log(e);
        io.emit("leaveGroup", null, "Could not leave group");
      }
    });

    // Returns the user as represented in the database
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
        io.emit("getUser", null, "Could not get user");
      }
    });

    // Returns all lists given a groupID
    socket.on("getLists", async groupID => {
      try {
        var lists = dbfunc.getLists(database, groupID);
        io.emit("getLists", lists, null);
      } catch (e) {
        console.log(e);
        io.emit("getLists", null, "Could not get lists");
      }
    });

    // Returns a list of the tasks in a list given the listID
    socket.on("getTasks", async listID => {
      try {
        var tasks = await dbfunc.getTasks(database, new objectID(listID));
        io.emit("getTasks", tasks, null);
      } catch (e) {
        console.log(e);
        io.emit("getTasks", null, "Could not get tasks");
      }
    });

    // Returns list of groups that a user belongs to, given username
    socket.on("getGroups", async userID => {
      try {
        var groups = await dbfunc.getGroups(database, new objectID(userID));
        io.emit("getGroups", groups, null);
      } catch (e) {
        console.log(e);
        io.emit("getGroups", null, e);
      }
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
