var mongo = require("mongodb").MongoClient;
var objectID = require("mongodb").ObjectID;
var url = "mongodb://localhost:27017/data/db";

mongo.connect(url, { useUnifiedTopology: true }, async function(err, db) {
  if (err) throw err;
  var database = db.db("mydb");
  var x = await addGroup("Grupp 2", "1");
  var id1 = addList(x, "Matlista");
  var id2 = addList(x, "Städning");
  console.log(id1, id2);
  db.close();
  // dbo.collection("customers").findOne({}, function(err, result) {
  //   if (err) throw err;
  //   console.log(result);
  //   db.close();
  // });

  // Creates a group and inserts it into the database with the given userID
  // Returns the ID of the newly created group
  async function addGroup(groupName, userID) {
    var groupToInsert = { name: groupName, users: [userID], lists: [] };
    const result = await database.collection("Groups").insertOne(groupToInsert);
    return result.ops[0]._id;
  }

  function addList(groupID, listName) {
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
});
