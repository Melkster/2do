var mongo = require("mongodb").MongoClient;
var objectID = require("mongodb").ObjectID;
var url = "mongodb://localhost:27017/data/db";

mongo.connect(url, { useUnifiedTopology: true }, async function(err, db) {
  if (err) throw err;
  var database = db.db("mydb");
  var userID = await registerUser("axel", "123");
  var group = await createGroup(userID, "Grupp 2");
  var list = await createList(group, "Matlista");
  var list2 = await createList(group, "Städa");
  var task = await addTask(list, "mat");
  var task3 = await addTask(list, "asd");
  var task2 = await addTask(list2, "asd");
  var tasks = await getTasks(list);
  console.log(tasks);
  db.close();

  // Creates a group and inserts it into the database with the given userID
  // Also inserts the groupID in the users groups array
  // Returns the ID of the newly created group
  async function createGroup(userID, groupName) {
    var groupToInsert = { name: groupName, users: [userID], lists: [] };
    var groupQuery = { _id: userID };
    try {
      const result = await database
        .collection("groups")
        .insertOne(groupToInsert);
      var groupIDToInsert = { $push: { groups: result.ops[0]._id } };
      await database.collection("users").updateOne(groupQuery, groupIDToInsert);
      return result.ops[0]._id;
    } catch (err) {
      throw err;
    }
  }

  // Inserts a list into the given group ID with given list name
  // Returns the ID of the newly created list
  async function createList(groupID, listName) {
    var id = new objectID();
    var listToInsert = {
      $push: { lists: { _id: id, name: listName, tasks: [] } }
    };
    var query = { _id: groupID };
    try {
      await database.collection("groups").updateOne(query, listToInsert);
      return id;
    } catch (err) {
      throw err;
    }
  }

  // Adds a task to the provided listID with the provided text
  // Returns the ID of the newly created task
  async function addTask(listID, value) {
    var id = new objectID();
    var taskToInsert = {
      $push: { "lists.$.tasks": { _id: id, value: value, checked: false } }
    };
    var query = { "lists._id": listID };
    try {
      await database.collection("groups").updateOne(query, taskToInsert);
      return id;
    } catch (err) {
      throw err;
    }
  }

  // Deletes a group with the given groupID
  // Also removes the groupID from the groups array from all the users who is in the group
  async function deleteGroup(groupID) {
    var usersToUpdate = { $pull: { groups: groupID } };
    var query = { groups: groupID };
    try {
      await database.collection("groups").deleteOne({ _id: groupID });
      await database.collection("users").updateMany(query, usersToUpdate);
    } catch (err) {
      throw err;
    }
  }

  // Adds a user with the given userID to the given groupID
  // Also inserts the groupID into the users groups array
  async function inviteUser(groupID, userID) {
    var userToInsert = { $push: { users: userID } };
    var query = { _id: groupID };
    var groupToInsert = { $push: { groups: groupID } };
    var groupQuery = { _id: userID };
    try {
      await database.collection("groups").updateOne(query, userToInsert);
      await database.collection("users").updateOne(groupQuery, groupToInsert);
    } catch (err) {
      throw err;
    }
  }

  // Removes the user with the given userID from the given groupID
  // Also removes the groupID from the groups array from the user with the userID
  async function leaveGroup(groupID, userID) {
    var userToRemove = { $pull: { users: userID } };
    var query = { _id: groupID };
    var groupToRemove = { $pull: { groups: groupID } };
    var userQuery = { groups: groupID };
    try {
      await database.collection("groups").updateOne(query, userToRemove);
      await database.collection("users").updateOne(userQuery, groupToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Changes the name of the given groupID to newName
  async function renameGroup(groupID, newName) {
    var newName = { $set: { name: newName } };
    var query = { _id: groupID };
    try {
      await database.collection("groups").updateOne(query, newName);
    } catch (err) {
      throw err;
    }
  }

  // Deletes a list with the given listID from the given groupID
  async function deleteList(listID) {
    var listToRemove = { $pull: { lists: { _id: listID } } };
    var query = { "lists._id": listID };
    try {
      console.log("delete");
      await database.collection("groups").updateOne(query, listToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Renames a list with the given listID with the new newName
  async function renameList(listID, newName) {
    var listToEdit = { $set: { "lists.$.name": newName } };
    var query = { "lists._id": listID };
    try {
      await database.collection("groups").updateOne(query, listToEdit);
    } catch (err) {
      throw err;
    }
  }

  // Deletes a task with the given taskID
  async function deleteTask(taskID) {
    var taskToRemove = { $pull: { "lists.$.tasks": { _id: taskID } } };
    var query = { "lists.tasks._id": taskID };
    try {
      await database.collection("groups").updateOne(query, taskToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Changes the value of the taskID in the listID to newValue
  async function editTask(listID, taskID, newValue) {
    var taskToEdit = {
      $set: { "lists.$[outer].tasks.$[inner].value": newValue }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists.tasks._id": taskID };
    try {
      await database
        .collection("groups")
        .updateOne(query, taskToEdit, arrayFilters);
    } catch (err) {
      throw err;
    }
  }

  // Checks the task with the taskID in the listID
  async function checkTask(listID, taskID) {
    var taskToCheck = {
      $set: { "lists.$[outer].tasks.$[inner].checked": true }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists._id": listID };
    try {
      await database
        .collection("groups")
        .updateOne(query, taskToCheck, arrayFilters);
    } catch (err) {
      throw err;
    }
  }

  // Unchecks the task with the taskID in the listID
  async function uncheckTask(listID, taskID) {
    var taskToCheck = {
      $set: { "lists.$[outer].tasks.$[inner].checked": false }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists._id": listID };
    try {
      await database
        .collection("groups")
        .updateOne(query, taskToCheck, arrayFilters);
    } catch (err) {
      throw err;
    }
  }

  // Returns the list field from the group with the given groupID
  async function getLists(groupID) {
    var query = { _id: groupID };
    var fields = { projection: { _id: 0, name: 0, users: 0 } };
    try {
      const result = await database.collection("groups").findOne(query, fields);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Inserts a new user into the users document with the given username and
  // passwordHash
  // Returns the users new userID
  async function registerUser(username, passwordHash) {
    var userToInsert = {
      name: username,
      passwordHash: passwordHash,
      groups: []
    };
    try {
      const result = await database.collection("users").insertOne(userToInsert);
      return result.ops[0]._id;
    } catch (err) {
      throw err;
    }
  }

  // Finds the user with the unique username and returns the whole user object
  async function getUser(username) {
    var userToFind = { name: username };
    try {
      const result = await database.collection("users").findOne(userToFind);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Returns all the tasks from the given listID as an array
  async function getTasks(listID) {
    var query = { "lists._id": listID };
    var projection = {
      projection: { _id: 0, "lists.name": 0, "lists._id": 0, lists: { $elemMatch: { _id: listID } } }
    };
    try {
      const result = await database
        .collection("groups")
        .findOne(query, projection);
      return result.lists[0].tasks;
    } catch (err) {
      throw err;
    }
  }
});
