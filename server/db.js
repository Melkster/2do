var mongo = require("mongodb").MongoClient;
var objectID = require("mongodb").ObjectID;
// var url = "mongodb://localhost:27017/data/db";

// Creates a group and inserts it into the database with the given userID
// Returns the ID of the newly created group

module.exports =  { 
    createGroup : async function(database, userID, groupName) {
	var groupToInsert = { name: groupName, users: [userID], lists: [] };
	try {
	    const result = await database.collection("Groups").insertOne(groupToInsert);
	    return result.ops[0]._id;
	}
	catch (err) {
	    throw err;
	}
    },

    // Inserts a list into the given group ID with given list name
    // Returns the ID of the newly created list
    createList : function (database, groupID, listName) {
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
    },

    // Adds a task to the provided groupID and listID with the provided text
    // Returns the ID of the newly created task
    addTask : function (database, groupID, listID, value) {
	var id = new objectID();
	var taskToInsert = {
	    $push: { "lists.$.tasks" : { _id: id, value: value, checked: false } }
	};
	// var query = { _id: groupID, "lists._id": listID };
	var query = { _id: groupID, "lists._id": listID };
	database.collection("Groups").updateOne(query, taskToInsert, (error, response) => {
	    if (error) throw (error);
	});
	return id;
    },

    // Deletes a group with the given groupID
    deleteGroup : function (database, groupID) {
	database.collection("Groups").deleteOne( { _id: groupID } );
    }
}

//});
