// TODO: try catch statements for all the events
// database functions export
// rewrite with real database functions
// MAKE TO NEW OBJECT IDS THINYG FOR ALL THE FUCKING FUNCTIONS

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
  //connection event i recieved every time a new user connects to server
  io.on("connection", socket => {
    console.log("A user connected");

    // Event that gets called when user navigates to a list, this joines a socket room
    // which gets updated everytime any member of the room makes a change
    // remove listID in print later
    socket.on("enterListRoom", listID => {
      var id = new objectID(listID);
      socket.join(id);
      io.in(id).emit("enterListRoom", "A user has joined the list-room: " + listID);
    });

    // Not used for now
    // TODO: groupID in print later
    socket.on("joinGroup", groupID => {
      var id = new obejctID(groupID);
      socket.join(id);
      console.log(id);
      io.in(id).emit("has joined", "A user has joined the group-room: " + groupID);
    });

    //TODO: does this even exist in db??
    socket.on("getGroups", () => {
      //TODO: return list of groups for a user
      try {
        io.emit("getGroups", 1);
      } catch (e) {
        console.log(e);
      }
    });

    //TODO: return list of lists for a group
    socket.on("getLists", groupID => {
      try {
        var lists = dbfunc.getLists(database, new objectID(groupID));
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
      //TODO: check a task given an ID
      try {
        await dbfunc.checkTask(database, new objectID(listID), new objectID(taskID));
        io.emit("checkTask", taskID, null);
      } catch (e) {
        io.emit("checkTask", null, "Could not check task");
        console.log(e);
      }
    });

    socket.on("uncheckTask", async (listID, taskID) => {
      //TODO: uncheck a task given an
      try {
        dbfunc.uncheckTask(database, new objectID(listID), new objectID(taskID));
        io.emit("uncheckTask", taskID, null);
      } catch (e) {
        io.emit("uncheckTask", null, "Could not uncheck task");
        console.log(e);
      }
    });

    socket.on("deleteTask", async taskID => {
      try {
        await dbfunc.deleteTask(database, new objectID(taskID));
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
        await dbfunc.renameGroup(database, groupID, value);
        io.emit("renameGroup", groupID, null);
      } catch (e) {
        io.emit("renameGroup", null, "Could not rename group");
        console.log(e);
      }
    });

    //------------------

    // Authenticate event sent when login on client, the authenticate function
    // is used to check the password compared to the one in database
    //
    // returns authenticate event with an error message if error occured and null if successfull
    // TODO: use real database instead of mock
    socket.on("authenticate", async (username, password) => {
      console.log("authenticate", username, password);
      if (!username) {
        io.emit("authenticate", null, "missing username");
      } else if (!password) {
        io.emit("authenticate", null, "missing password");
      } else {
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
        try {
          var passwordHash = await hash_password(password);
          await dbfunc.registerUser(database, username, passwordHash);
        } catch (e) {
          io.emit("register", null, "could not register user");
          console.log(e);
        }
      }
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

    // Used only for debug purposes
    // TODO: remove later
    socket.on("chatMessage", (msg, group) => {
      io.in(group).emit("message", msg);
      console.log("Message: ", msg);
    });

    async function hash_password(user, password) {
      const hash3 = await bcrypt.hash(password, salt);
      return hash3;
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
