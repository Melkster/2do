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
  editTask(list, task, "Då");
  // await addTask(list, "asd");
  // task1 = await addTask(list, "tvätta");
  // await addTask(list, "städa");
  // deleteTask(group, list, task1);
  // console.log(task);
  // deleteTask(group, list, task);
  // renameList(y, "Då");
  // deleteList(y);
  //z = await createList(x, "Omg");
  // console.log(y);
  //renameList(x, z, "Då");

  db.close();
  // dbo.collection("customers").findOne({}, function(err, result) {
  //   if (err) throw err;
  //   console.log(result);
  //   db.close();
  // });

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
      console.log("delete");
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

  // Deletes a task with the given taskID from the list with the given listID
  function deleteTask(listID, taskID) {
    var taskToRemove = { $pull: { "lists.$.tasks": { _id: taskID } } };
    var query = { "lists._id": listID };
    try {
      database.collection("Groups").updateOne(query, taskToRemove);
    } catch (err) {
      throw err;
    }
  }

  // Changes the value of the taskID in the listID to newValue
  function editTask(listID, taskID, newValue) {
    var taskToEdit = {
      $set: { "lists.$[outer].tasks.$[inner].value": newValue }
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
});
