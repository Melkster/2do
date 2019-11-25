var mongo = require("mongodb").MongoClient;
var objectID = require("mongodb").ObjectID;
// var url = "mongodb://localhost:27017/data/db";

// Creates a group and inserts it into the database with the given userID
// Returns the ID of the newly created group

module.exports = {
  // Creates a group and inserts it into the database with the given userID
  // Returns the ID of the newly created group
  createGroup: async function(userID, groupName) {
    var groupToInsert = { name: groupName, users: [userID], lists: [] };
    try {
      const result = await database.collection("groups").insertOne(groupToInsert);
      return result.ops[0]._id;
    } catch (err) {
      throw err;
    }
  },

  // Inserts a list into the given group ID with given list name
  // Returns the ID of the newly created list
  createList: async function(groupID, listName) {
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
  },

  // Adds a task to the provided listID with the provided text
  // Returns the ID of the newly created task
  addTask: async function(listID, value) {
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
  },

  // Deletes a group with the given groupID
  deleteGroup: async function(groupID) {
    try {
      await database.collection("groups").deleteOne({ _id: groupID });
    } catch (err) {
      throw err;
    }
  },

  // Adds a user with the given userID to the given groupID
  inviteUser: async function(groupID, userID) {
    var userToInsert = { $push: { users: userID } };
    var query = { _id: groupID };
    try {
      await database.collection("groups").updateOne(query, userToInsert);
    } catch (err) {
      throw err;
    }
  },

  // Removes the user with the given userID from the given groupID
  leaveGroup: async function(groupID, userID) {
    var userToRemove = { $pull: { users: userID } };
    var query = { _id: groupID };
    try {
      await database.collection("groups").updateOne(query, userToRemove);
    } catch (err) {
      throw err;
    }
  },

  // Changes the name of the given groupID to newName
  renameGroup: async function(groupID, newName) {
    var newName = { $set: { name: newName } };
    var query = { _id: groupID };
    try {
      await database.collection("groups").updateOne(query, newName);
    } catch (err) {
      throw err;
    }
  },

  // Deletes a list with the given listID from the given groupID
  deleteList: async function(listID) {
    var listToRemove = { $pull: { lists: { _id: listID } } };
    var query = { "lists._id": listID };
    try {
      console.log("delete");
      await database.collection("groups").updateOne(query, listToRemove);
    } catch (err) {
      throw err;
    }
  },

  // Renames a list with the given listID with the new newName
  renameList: async function(listID, newName) {
    var listToEdit = { $set: { "lists.$.name": newName } };
    var query = { "lists._id": listID };
    try {
      await database.collection("groups").updateOne(query, listToEdit);
    } catch (err) {
      throw err;
    }
  },

  // Deletes a task with the given taskID
  deleteTask: async function(taskID) {
    var taskToRemove = { $pull: { "lists.$.tasks": { _id: taskID } } };
    var query = { "lists.tasks._id": taskID };
    try {
      await database.collection("groups").updateOne(query, taskToRemove);
    } catch (err) {
      throw err;
    }
  },

  // Changes the value of the taskID in the listID to newValue
  editTask: async function(listID, taskID, newValue) {
    var taskToEdit = {
      $set: { "lists.$[outer].tasks.$[inner].value": newValue }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists.tasks._id": taskID };
    try {
      await database.collection("groups").updateOne(query, taskToEdit, arrayFilters);
    } catch (err) {
      throw err;
    }
  },

  // Checks the task with the taskID in the listID
  checkTask: async function(listID, taskID) {
    var taskToCheck = {
      $set: { "lists.$[outer].tasks.$[inner].checked": true }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists._id": listID };
    try {
      await database.collection("groups").updateOne(query, taskToCheck, arrayFilters);
    } catch (err) {
      throw err;
    }
  },

  // Unchecks the task with the taskID in the listID
  uncheckTask: async function(listID, taskID) {
    var taskToCheck = {
      $set: { "lists.$[outer].tasks.$[inner].checked": false }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists._id": listID };
    try {
      await database.collection("groups").updateOne(query, taskToCheck, arrayFilters);
    } catch (err) {
      throw err;
    }
  },

  // Returns the list field from the group with the given groupID
  getLists: function(groupID) {
    query = { _id: groupID };
    fields = { _id: 0, name: 0, users: 0 };
    try {
      const result = database
        .collection("groups")
        .find(query)
        .project(fields);
      return result.toArray();
    } catch (err) {
      throw err;
    }
  },

  // Inserts a new user into the users document with the given username and passwordHash
  registerUser: async function(username, passwordHash) {
    var userToInsert = {
      name: username,
      passwordHash: passwordHash,
      groups: []
    };
    try {
      await database.collection("users").insertOne(userToInsert);
    } catch (err) {
      throw err;
    }
  }
};
