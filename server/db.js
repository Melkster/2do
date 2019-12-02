var objectID = require("mongodb").ObjectID;
module.exports = {
  // Creates a group and inserts it into the database with the given userID
  // Also inserts the groupID in the users groups array
  // Returns the ID of the newly created group
  createGroup: async function(database, userID, groupName) {
    var groupToInsert = { name: groupName, users: [userID], lists: [] };
    var groupQuery = { _id: userID };
    try {
      const result = await database.collection("groups").insertOne(groupToInsert);
      var groupIDToInsert = { $push: { groups: result.ops[0]._id } };
      await database.collection("users").updateOne(groupQuery, groupIDToInsert);
      return result.ops[0]._id;
    } catch (err) {
      throw err;
    }
  },

  //Inserts a list into the given group ID with given list name
  //Returns the ID of the newly created list
  createList: async function(database, groupID, listName) {
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
  addTask: async function(database, listID, value) {
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
  // Also removes the groupID from the groups array from all the users who is in the group
  deleteGroup: async function(database, groupID) {
    var usersToUpdate = { $pull: { groups: groupID } };
    var query = { groups: groupID };
    try {
      await database.collection("groups").deleteOne({ _id: groupID });
      await database.collection("users").updateMany(query, usersToUpdate);
    } catch (err) {
      throw err;
    }
  },

  // Deletes a list with the given listID from the given groupID
  deleteList: async function(database, listID) {
    var listToRemove = { $pull: { lists: { _id: listID } } };
    var query = { "lists._id": listID };
    try {
      await database.collection("groups").updateOne(query, listToRemove);
    } catch (err) {
      throw err;
    }
  },

  // Deletes a task with the given taskID
  deleteTask: async function(database, taskID) {
    var taskToRemove = { $pull: { "lists.$.tasks": { _id: taskID } } };
    var query = { "lists.tasks._id": taskID };
    try {
      await database.collection("groups").updateOne(query, taskToRemove);
    } catch (err) {
      throw err;
    }
  },

  // Changes the name of the given groupID to newName
  renameGroup: async function(database, groupID, newName) {
    var newName = { $set: { name: newName } };
    var query = { _id: groupID };
    try {
      await database.collection("groups").updateOne(query, newName);
    } catch (err) {
      throw err;
    }
  },

  // Renames a list with the given listID with the new newName
  renameList: async function(database, listID, newName) {
    var listToEdit = { $set: { "lists.$.name": newName } };
    var query = { "lists._id": listID };
    try {
      await database.collection("groups").updateOne(query, listToEdit);
    } catch (err) {
      throw err;
    }
  },

  // Changes the value of the taskID in the listID to newValue
  editTask: async function(database, listID, taskID, newValue) {
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
  checkTask: async function(database, listID, taskID) {
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
  uncheckTask: async function(database, listID, taskID) {
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
  getLists: async function(database, groupID) {
    var query = { _id: groupID };
    var fields = { projection: { _id: 0, name: 0, users: 0 } };
    try {
      const result = await database.collection("groups").findOne(query, fields);
      return result.lists;
    } catch (err) {
      throw err;
    }
  },

  // Adds a user with the given userID to the given groupID
  // Also inserts the groupID into the users groups array
  inviteUser: async function(database, groupID, userID) {
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
  },

  // Removes the user with the given userID from the given groupID
  // Also removes the groupID from the groups array from the user with the userID
  leaveGroup: async function(database, groupID, userID) {
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
  },

  // Inserts a new user into the users document with the given username and passwordHash
  // Returns the new userID
  registerUser: async function(database, username, passwordHash) {
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
  },

  // Finds the user with the unique username and returns the whole user object
  getUser: async function(database, username) {
    var userToFind = { name: username };
    try {
      const result = await database.collection("users").findOne(userToFind);
      return result;
    } catch (err) {
      throw err;
    }
  },

  // Returns all the tasks from the given listID as an array
  getTasks: async function(database, listID) {
    var query = { "lists._id": listID };
    var projection = {
      projection: { _id: 0, "lists.name": 0, "lists._id": 0, lists: { $elemMatch: { _id: listID } } }
    };
    try {
      const result = await database.collection("groups").findOne(query, projection);
      return result.lists[0].tasks;
    } catch (err) {
      throw err;
    }
  }
};
