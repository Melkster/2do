const { MongoClient } = require("mongodb");
const dbfunc = require("../db");

describe("insert", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
  });

  it("Tests all the functions in the database", async () => {
    // Database collections
    const users = db.collection("users");
    const groups = db.collection("groups");

    // Variables
    var userID;
    var groupID;
    var listID;
    var taskID;
    var mockUser;
    var mockGroup;
    var registeredUser;
    var createdGroup;
    var createdTask;
    var username = "Axel";
    var passwordHash = "123";
    var groupName = "Grupp 2";
    var listName = "Matlista"; 
    var taskValue = "Falukorv";

    userID = await dbfunc.registerUser(db, username, passwordHash);
    registeredUser = await dbfunc.getUser(db, username);
    mockUser = { _id: userID, name: username, passwordHash: passwordHash, groups: [] };
    expect(registeredUser).toEqual(mockUser);

    groupID = await dbfunc.createGroup(db, userID, groupName);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup = { _id: groupID, name: groupName, users: [userID], lists: [] };
    expect(createdGroup).toEqual(mockGroup);
    registeredUser = await dbfunc.getUser(db, username);
    mockUser.groups.push(groupID);
    expect(registeredUser).toEqual(mockUser);

    listID = await dbfunc.createList(db, groupID, listName);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists.push({_id: listID, name: listName, tasks: []});
    expect(createdGroup).toEqual(mockGroup);

    taskID = await dbfunc.addTask(db, listID, taskValue);
    createdGroup = await groups.findOne({_id : groupID});
    mockGroup.lists[0].tasks.push({_id: taskID, value: taskValue, checked: false});
    expect(createdGroup).toEqual(mockGroup);
  });
});
