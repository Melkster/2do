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
  addTask(list, "asd");
  //lists = await getLists(group);
  //obj = JSON.stringify(lists);
  //console.log(obj);
  //editUncheckedTask(list, task, "Då");
  checkTask(list, task);
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
      $push: {
        lists: { _id: id, name: listName, uncheckedTasks: [], checkedTasks: [] }
      }
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
      $push: {
        "lists.$.uncheckedTasks": { _id: id, value: value, checked: false }
      }
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
  function deleteGroup(groupID) {
    try {
      database.collection("Groups").deleteOne({ _id: groupID });
    } catch (err) {
      throw err;
    }
  }

  // Adds a user with the given userID to the given groupID
  function inviteUser(groupID, userID) {
    var userToInsert = { $push: { users: userID } };
    var query = { _id: groupID };
    try {
      database.collection("Groups").updateOne(query, userToInsert);
    } catch (err) {
      throw err;
    }
  }

  // Removes the user with the given userID from the given groupID
  function leaveGroup(groupID, userID) {
    var userToRemove = { $pull: { users: userID } };
    var query = { _id: groupID };
    try {
      database.collection("Groups").updateOne(query, userToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Changes the name of the given groupID to newName
  function renameGroup(groupID, newName) {
    var newName = { $set: { name: newName } };
    var query = { _id: groupID };
    try {
      database.collection("Groups").updateOne(query, newName);
    } catch (err) {
      throw err;
    }
  }

  // Deletes a list with the given listID from the given groupID
  function deleteList(listID) {
    var listToRemove = { $pull: { lists: { _id: listID } } };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, listToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Renames a list with the given listID with the new newName
  function renameList(listID, newName) {
    var listToEdit = { $set: { "lists.$.name": newName } };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, listToEdit);
    } catch (err) {
      throw err;
    }
  }

  // Deletes a unchecked task with the given taskID from the list with the given listID
  function deleteUncheckedTask(listID, taskID) {
    var taskToRemove = { $pull: { "lists.$.uncheckedTasks": { _id: taskID } } };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, taskToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Deletes a unchecked task with the given taskID from the list with the given listID
  function deleteCheckedTask(listID, taskID) {
    var taskToRemove = { $pull: { "lists.$.checkedTasks": { _id: taskID } } };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, taskToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Changes the value of the unchecked task with the given taskID in the listID to newValue
  function editUncheckedTask(listID, taskID, newValue) {
    var taskToEdit = {
      $set: { "lists.$[outer].uncheckedTasks.$[inner].value": newValue }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, taskToEdit, arrayFilters);
    } catch (err) {
      throw err;
    }
  }

  // Changes the value of the checkek task with the given taskID in the listID to newValue
  function editCheckedTask(listID, taskID, newValue) {
    var taskToEdit = {
      $set: { "lists.$[outer].checkedTasks.$[inner].value": newValue }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, taskToEdit, arrayFilters);
    } catch (err) {
      throw err;
    }
  }

  // Checks the task with the taskID in the listID
  async function checkTask(listID, taskID) {
    var taskToCheck = {
      $pull: { "lists.$.uncheckedTasks": { _id: taskID } }
    };
    // var filters = {
    //   projection: { _id: 0, name: 0, users: 0, "lists._id": 0, "lists.name": 0, "lists.checkedTasks": 0 }
    // };
    var filters = {
      projection: {"lists.uncheckedTasks._id": 1}
    };
    // var query = { "lists._id": listID };//, "lists.$[outer].uncheckedTasks.$[inner]._id": taskID};
    var query = { "lists.uncheckedTasks._id": taskID}
    try {
      const result = await database
        .collection("Groups")
        .findOneAndUpdate(query, taskToCheck);//, filters);
      // obj = result.toArray();
      console.log(JSON.stringify(result.value));
    } catch (err) {
      throw err;
    }
  }

  // Unchecks the task with the taskID in the listID
  function uncheckTask(listID, taskID) {
    var taskToCheck = {
      $set: { "lists.$[outer].tasks.$[inner].checked": false }
    };
    var arrayFilters = {
      arrayFilters: [{ "outer._id": listID }, { "inner._id": taskID }]
    };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, taskToCheck, arrayFilters);
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
