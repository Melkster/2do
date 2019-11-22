var mongo = require("mongodb").MongoClient;
var objectID = require("mongodb").ObjectID;
var url = "mongodb://localhost:27017/data/db";

mongo.connect(url, { useUnifiedTopology: true }, async function(err, db) {
  if (err) throw err;
  var database = db.db("mydb");
  var group = await createGroup("1", "Grupp 2");
  console.log(group);
  list = await createList(group, "Hej");
  console.log(list);
  task = await addTask(list, "test");
  await checkTask(list, task)
  await uncheckTask(list, task);

  db.close();

  // Creates a group and inserts it into the database with the given userID
  // Returns the ID of the newly created group
  async function createGroup(userID, groupName) {
    var groupToInsert = { name: groupName, users: [userID], lists: [] };
    try {
      const result = await database
        .collection("Groups")
        .insertOne(groupToInsert);
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
      await database.collection("Groups").updateOne(query, listToInsert);
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
      await database.collection("Groups").updateOne(query, taskToInsert);
      return id;
    } catch (err) {
      throw err;
    }
  }

  // Deletes a group with the given groupID
  async function deleteGroup(groupID) {
    try {
      await database.collection("Groups").deleteOne({ _id: groupID });
    } catch (err) {
      throw err;
    }
  }

  // Adds a user with the given userID to the given groupID
  async function inviteUser(groupID, userID) {
    var userToInsert = { $push: { users: userID } };
    var query = { _id: groupID };
    try {
      await database.collection("Groups").updateOne(query, userToInsert);
    } catch (err) {
      throw err;
    }
  }

  // Removes the user with the given userID from the given groupID
  async function leaveGroup(groupID, userID) {
    var userToRemove = { $pull: { users: userID } };
    var query = { _id: groupID };
    try {
      await database.collection("Groups").updateOne(query, userToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Changes the name of the given groupID to newName
  async function renameGroup(groupID, newName) {
    var newName = { $set: { name: newName } };
    var query = { _id: groupID };
    try {
      await database.collection("Groups").updateOne(query, newName);
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
      await database.collection("Groups").updateOne(query, listToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Renames a list with the given listID with the new newName
  async function renameList(listID, newName) {
    var listToEdit = { $set: { "lists.$.name": newName } };
    var query = { "lists._id": listID };
    try {
      await database.collection("Groups").updateOne(query, listToEdit);
    } catch (err) {
      throw err;
    }
  }

  // Deletes a task with the given taskID
  async function deleteTask(taskID) {
    var taskToRemove = { $pull: { "lists.$.tasks": { _id: taskID } } };
    var query = { "lists.tasks._id": taskID };
    try {
      await database.collection("Groups").updateOne(query, taskToRemove);
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
      await database.collection("Groups").updateOne(query, taskToEdit, arrayFilters);
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
      await database.collection("Groups").updateOne(query, taskToCheck, arrayFilters);
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
      await database.collection("Groups").updateOne(query, taskToCheck, arrayFilters);
    } catch (err) {
      throw err;
    }
  }
  
  // Returns the list field from the group with the given groupID
  function getLists(groupID) {
    query = { _id: groupID };
    fields = { _id: 0, name: 0, users: 0 };
    try {
      const result = database
        .collection("Groups")
        .find(query)
        .project(fields);
      return result.toArray();
    } catch (err) {
      throw err;
    }
  }
});
