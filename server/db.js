var objectID = require("mongodb").ObjectID;
module.exports = {
  // Creates a group and inserts it into the database with the given userID
  // Also inserts the groupID in the users groups array
  // Returns the ID of the newly created group
  createGroup: async function(database, userID, groupName) {
    var groupToInsert = { name: groupName, users: [userID], lists: [] };
    var userQuery = { _id: userID };
    var groupID, result, userResult;
    // Insert the new group to the db and push the groupID into the user's group array
    try {
      result = await database.collection("groups").insertOne(groupToInsert);
      if (!result) {
        const error = new Error("Couldnt insert group into db");
        error.code = "insertGroup";
        throw error;
      }
      groupID = result.ops[0]._id;
      var groupIDToInsert = { $push: { groups: groupID } };
      userResult = await database.collection("users").updateOne(userQuery, groupIDToInsert);
    } catch (err) {
      if ((err.code = "insertGroup")) {
        throw err.message;
      }
      console.log(err);
      throw "Something went wrong in db";
    }
    // Error handling
    if (userResult.result.nModified == "0") {
      try {
        // If updating the user failed, we want to delete the newly created group
        await this.deleteGroup(database, groupID);
      } catch (err) {
        throw err;
      }
      throw "Couldn't insert the groupID in the user, deleting new group";
    }
    return groupID;
  },

  //Inserts a list into the given group ID with given list name
  //Returns the ID of the newly created list
  createList: async function(database, groupID, listName) {
    var id = new objectID();
    var result;
    var listToInsert = {
      $push: { lists: { _id: id, name: listName, tasks: [] } }
    };
    var query = { _id: groupID };
    try {
      result = await database.collection("groups").updateOne(query, listToInsert);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    // Error handling
    if (result.result.nModified == "0") {
      throw "Couldn't create a new list";
    }
    return id;
  },

  // Adds a task to the provided listID with the provided text
  // Returns the ID of the newly created task
  addTask: async function(database, listID, value) {
    var id = new objectID();
    var result;
    var taskToInsert = {
      $push: { "lists.$.tasks": { _id: id, value: value, checked: false } }
    };
    var query = { "lists._id": listID };
    try {
      result = await database.collection("groups").updateOne(query, taskToInsert);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't create a new task";
    }
    return id;
  },

  // Deletes a group with the given groupID
  // Also removes the groupID from the groups array from all the users who is in the group
  deleteGroup: async function(database, groupID) {
    var usersToUpdate = { $pull: { groups: groupID } };
    var query = { groups: groupID };
    var result, userResult;
    try {
      result = await database.collection("groups").deleteOne({ _id: groupID });
      userResult = await database.collection("users").updateMany(query, usersToUpdate);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.deletedCount == 0) {
      throw "Couldn't delete the group";
    }
    if (userResult.modifiedCount == 0) {
      throw "Couldn't delete groupID from users";
    }
  },

  // Deletes a list with the given listID from the given groupID
  deleteList: async function(database, listID) {
    var listToRemove = { $pull: { lists: { _id: listID } } };
    var query = { "lists._id": listID };
    var result;
    try {
      result = await database.collection("groups").updateOne(query, listToRemove);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't delete the list";
    }
  },

  // Deletes a task with the given taskID
  deleteTask: async function(database, taskID) {
    var taskToRemove = { $pull: { "lists.$.tasks": { _id: taskID } } };
    var query = { "lists.tasks._id": taskID };
    var result;
    try {
      result = await database.collection("groups").updateOne(query, taskToRemove);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't delete the task";
    }
  },

  // Changes the name of the given groupID to newName
  renameGroup: async function(database, groupID, newName) {
    var newName = { $set: { name: newName } };
    var query = { _id: groupID };
    var result;
    try {
      result = await database.collection("groups").updateOne(query, newName);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't rename the group";
    }
  },

  // Renames a list with the given listID with the new newName
  renameList: async function(database, listID, newName) {
    var listToEdit = { $set: { "lists.$.name": newName } };
    var query = { "lists._id": listID };
    var result;
    try {
      result = await database.collection("groups").updateOne(query, listToEdit);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't rename the list";
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
    var result;
    try {
      result = await database.collection("groups").updateOne(query, taskToEdit, arrayFilters);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't edit the task";
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
    var result;
    try {
      result = await database.collection("groups").updateOne(query, taskToCheck, arrayFilters);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't rename the list";
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
    var result;
    try {
      result = await database.collection("groups").updateOne(query, taskToCheck, arrayFilters);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't uncheck the task";
    }
  },

  // Returns the list field from the group with the given groupID
  getLists: async function(database, groupID) {
    var query = { _id: groupID };
    var fields = { projection: { _id: 0, name: 0, users: 0 } };
    var result;
    try {
      result = await database.collection("groups").findOne(query, fields);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (!result) {
      throw "Couldn't find the group";
    }
    return result.lists;
  },

  // Adds a user with the given userID to the given groupID
  // Also inserts the groupID into the users groups array
  inviteUser: async function(database, groupID, username) {
    var userID;
    try {
      const result = await this.getUser(database, username);
      userID = result._id;
    } catch (err) {
      throw err;
    }
    var userToInsert = { $push: { users: userID } };
    var query = { _id: groupID };
    var groupIDToInsert = { $push: { groups: groupID } };
    var userQuery = { _id: userID };
    var result, userResult;
    try {
      result = await database.collection("groups").updateOne(query, userToInsert);
      userResult = await database.collection("users").updateOne(userQuery, groupIDToInsert);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    //Error handling
    if (result.result.nModified == "0") {
      var userQuery = { _id: userID };
      var groupIDToRemove = { $pull: { groups: groupID } };
      await database.collection("users").updateOne(userQuery, groupIDToRemove);
      throw "Couldn't push the userID into the group";
    }
    if (userResult.result.nModified == "0") {
      try {
        // If we cant insert groupID into user, remove userID from group
        await this.leaveGroup(database, groupID, userID);
      } catch (err) {
        throw err;
      }
      throw "Couldn't push the groupID into the user, removing userID from group";
    }
  },

  // Removes the user with the given userID from the given groupID
  // Also removes the groupID from the groups array from the user with the userID
  leaveGroup: async function(database, groupID, userID) {
    var userToRemove = { $pull: { users: userID } };
    var query = { _id: groupID };
    var groupToRemove = { $pull: { groups: groupID } };
    var userQuery = { _id: userID };
    var result, userResult;
    try {
      result = await database.collection("groups").updateOne(query, userToRemove);
      userResult = await database.collection("users").updateOne(userQuery, groupToRemove);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (result.result.nModified == "0") {
      throw "Couldn't remove the userID from the group";
    }
    if (userResult.result.nModified == "0") {
      throw "Couldn't remove the groupID from the user";
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
    var result;
    try {
      result = await database.collection("users").insertOne(userToInsert);
    } catch (err) {
      if ((err.code = "11000")) {
        throw "The username is already taken";
      }
      console.log(err);
      throw "Something went wrong in db";
    }
    if (!result) {
      throw "Couldn't register the user";
    }
    return result.ops[0]._id;
  },

  // Finds the user with the unique username and returns the whole user object
  getUser: async function(database, username) {
    var userToFind = { name: username };
    var result;
    try {
      result = await database.collection("users").findOne(userToFind);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (!result) {
      console.log("asd");
      throw "Couldn't find user";
    }
    return result;
  },

  // Returns all the tasks from the given listID as an array
  getTasks: async function(database, listID) {
    var query = { "lists._id": listID };
    var projection = {
      projection: {
        _id: 0,
        "lists.name": 0,
        "lists._id": 0,
        lists: { $elemMatch: { _id: listID } }
      }
    };
    var result;
    try {
      result = await database.collection("groups").findOne(query, projection);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (!result) {
      throw "Couldn't find list with tasks";
    }
    return result.lists[0].tasks;
  },

  // Returns the ID and name of all the groups the username is in
  getGroups: async function(database, userID) {
    var user;
    var userQuery = { _id: userID };
    try {
      user = await database.collection("users").findOne(userQuery);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (!user) {
      throw "Couldn't find the user";
    }
    var ids = user.groups;
    var query = { _id: { $in: ids } };
    var projection = { projection: { users: 0, lists: 0 } };
    var result;
    try {
      result = await database.collection("groups").find(query, projection);
    } catch (err) {
      console.log(err);
      throw "Something went wrong in db";
    }
    if (!result) {
      throw "Couldn't find the groups";
    }
    return result.toArray();
  }
};
