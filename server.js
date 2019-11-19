var mongo = require("mongodb").MongoClient;
var objectID = require("mongodb").ObjectID;
var url = "mongodb://localhost:27017/data/db";

mongo.connect(url, { useUnifiedTopology: true }, async function(err, db) {
  if (err) throw err;
  var database = db.db("mydb");
  var x = await createGroup("1", "Grupp 2");
  console.log(x);
  inviteUser(x, "2");
  leaveGroup(x, "1");
  // var y = await createGroup("2", "Grupp 3");
  // deleteGroup(y);
  // var id1 = createList(x, "Matlista");
  // var id2 = createList(x, "Städning");
  // console.log(id1);
  // var id3 = addTask(x, id2, "Mjölk");
  // var id4 = addTask(x, id2, "Pizza");
  // var id5 = addTask(x, id1, "Soppa");
  // console.log(id3);
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
  function createList(groupID, listName) {
    var id = new objectID();
    var listToInsert = {
      $push: { lists: { _id: id, name: listName, tasks: [] } }
    };
    var query = { _id: groupID };
    database
      .collection("Groups")
      .updateOne(query, listToInsert, (error, response) => {
        if (error) throw error;
      });
    return id;
  }

  // Adds a task to the provided groupID and listID with the provided text
  // Returns the ID of the newly created task
  function addTask(groupID, listID, value) {
    var id = new objectID();
    var taskToInsert = {
      $push: { "lists.$.tasks": { _id: id, value: value, checked: false } }
    };
    // var query = { _id: groupID, "lists._id": listID };
    var query = { _id: groupID, "lists._id": listID };
    database
      .collection("Groups")
      .updateOne(query, taskToInsert, (error, response) => {
        if (error) throw error;
      });
    return id;
  }

  // Deletes a group with the given groupID
  function deleteGroup(groupID) {
    database.collection("Groups").deleteOne({ _id: groupID });
  }

  // Adds a user with the given userID to the given groupID
  function inviteUser(groupID, userID) {
    var userToInsert = { $push: { users:  userID  } };
    var query = { _id: groupID };
    database.collection("Groups").updateOne(query, userToInsert);
  }

  // Removes the user with the given userID from the given groupID
  function leaveGroup(groupID, userID) {
    var userToRemove = { $pull: { users: userID }};
    var query = { _id: groupID };
    database.collection("Groups").updateOne(query, userToRemove);
  }



});
