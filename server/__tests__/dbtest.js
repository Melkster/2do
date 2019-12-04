const { MongoClient } = require("mongodb");
const dbfunc = require("../db");

describe("db tests", () => {
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

    // Tests: registerUser, getUser
    userID = await dbfunc.registerUser(db, username, passwordHash);
    registeredUser = await dbfunc.getUser(db, username);
    mockUser = { _id: userID, name: username, passwordHash: passwordHash, groups: [] };
    expect(registeredUser).toEqual(mockUser);

    // Tests: createGroup, getUser
    groupID = await dbfunc.createGroup(db, userID, groupName);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup = { _id: groupID, name: groupName, users: [userID], lists: [] };
    expect(createdGroup).toEqual(mockGroup);
    registeredUser = await dbfunc.getUser(db, username);
    mockUser.groups.push(groupID);
    expect(registeredUser).toEqual(mockUser);

    // Tests: createList
    listID = await dbfunc.createList(db, groupID, listName);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists.push({ _id: listID, name: listName, tasks: [] });
    expect(createdGroup).toEqual(mockGroup);

    // Tests: addTask
    taskID = await dbfunc.addTask(db, listID, taskValue);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists[0].tasks.push({ _id: taskID, value: taskValue, checked: false });
    expect(createdGroup).toEqual(mockGroup);

    // Tests: renameGroup
    groupName = "Grupp 1";
    await dbfunc.renameGroup(db, groupID, groupName);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.name = groupName;
    expect(createdGroup).toEqual(mockGroup);

    // Tests: renameList
    listName = "Städlista";
    await dbfunc.renameList(db, listID, listName);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists[0].name = listName;
    expect(createdGroup).toEqual(mockGroup);

    // Tests: editTask
    taskValue = "Mjölk";
    await dbfunc.editTask(db, listID, taskID, taskValue);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists[0].tasks[0].value = taskValue;
    expect(createdGroup).toEqual(mockGroup);

    // Tests: checkTask
    await dbfunc.checkTask(db, listID, taskID);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists[0].tasks[0].checked = true;
    expect(createdGroup).toEqual(mockGroup);

    // Tests: uncheckTask
    await dbfunc.uncheckTask(db, listID, taskID);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists[0].tasks[0].checked = false;
    expect(createdGroup).toEqual(mockGroup);

    // Tests: inviteUser, getUser
    await dbfunc.inviteUser(db, groupID, username);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.users.push(userID);
    expect(createdGroup).toEqual(mockGroup);
    registeredUser = await dbfunc.getUser(db, username);
    mockUser.groups.push(groupID);
    expect(registeredUser).toEqual(mockUser);
    
    // Tests: getGroups
    var userGroups = await dbfunc.getGroups(db, userID);
    expect(userGroups).toEqual([ { _id: groupID, name: groupName} ]);

    // Tests: getTasks
    var tasks = await dbfunc.getTasks(db, listID);
    var mockTasks = [{ _id: taskID, value: taskValue, checked: false }];
    expect(tasks).toEqual(mockTasks);

    // Tests: getLists
    var list = await dbfunc.getLists(db, groupID);
    var mockList = [{ _id: listID, name: listName, tasks: mockTasks }];
    expect(list).toEqual(mockList);

    // Tests: leaveGroup
    await dbfunc.leaveGroup(db, groupID, userID);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.users = [];
    expect(createdGroup).toEqual(mockGroup);
    registeredUser = await dbfunc.getUser(db, username);
    mockUser.groups = [];
    expect(registeredUser).toEqual(mockUser);

    // Tests: deleteTask
    await dbfunc.deleteTask(db, taskID);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists[0].tasks = [];
    expect(createdGroup).toEqual(mockGroup);

    // Tests: deleteList
    await dbfunc.deleteList(db, listID);
    createdGroup = await groups.findOne({ _id: groupID });
    mockGroup.lists = [];
    expect(createdGroup).toEqual(mockGroup);

    // Tests: deleteGroup
    await dbfunc.inviteUser(db, groupID, username);
    await dbfunc.deleteGroup(db, groupID);
    createdGroup = await groups.findOne({ _id: groupID });
    expect(createdGroup).toEqual(null);
    registeredUser = await dbfunc.getUser(db, username);
    expect(registeredUser).toEqual(mockUser);
  });
});
