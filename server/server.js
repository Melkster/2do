var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bcrypt = require('bcrypt');

var mongo = require("mongodb").MongoClient;
//var objectID = require("mongodb").ObjectID;
var url = "mongodb://localhost:27017/data/db";

var dbfunc = require('./db');
//var database = new db();

//console.log(typeof db.createGroup);
var users = [{
    name : 'melker',
    passwordhash : 'aa'
},{
    name : 'michael',
    passwordhash : 'bb'
},{
    name : 'axel',
    passwordhash : 'cc'
},{
    name : 'vanja',
    passwordhash : 'dd'
}]

mongo.connect(url, { useUnifiedTopology: true }, async function(err, db) {
    var database = db.db("mydb");
    
    //var x = await dbfunc.createGroup(database, "5", "Grupp 8");
    //var y = await dbfunc.createGroup(database, "5", "Grupp 1");
    // var id1 = dbfunc.createList(database, x, "aaaa");
    // var id2 = dbfunc.createList(database, x, "bbbb");
    // var id3 = dbfunc.addTask(database, x, id2, "mat");
    // var id4 = dbfunc.addTask(database, x, id2, "mera");
    // var id5 = dbfunc.addTask(database, x, id1, "annat");
    
    io.on('connection', socket => {
	console.log('A user connected');
	socket.on('authenticate', (username, password) => {
	    if(!username){
		io.emit('error', 'missing username');
	    } else if(!password){
		io.emit('error', 'missing password');
	    }
	    else{
		(async () => {
		    var res = await authenticate(username,password);
		    if(res){
			io.emit('success', 'USERID');
		    } else {
			io.emit('error', 'Autentication failed')
		    }
		})();
	    }
	    
	})
	
	socket.on('joinList', listID => {
	    socket.join(listID);
	    console.log(listID);
	    io.in(listID).emit('has joined', 'A user has joined the list-room: ' + listID);
	})

	socket.on('joinGroup', groupID => {
	    socket.join(groupID);
	    console.log(groupID);
	    io.in(groupID).emit('has joined', 'A user has joined the group-room: ' + groupID);
	})
	
	socket.on('chatMessage', (msg, group) => {
	    io.in(group).emit('message', msg);
	    console.log('Message: ', msg);
	})

	socket.on('getGroups', userID => {
	    //TODO: return list of groups for a user
	    
	})

	socket.on('getLists', groupID => {
	    //TODO: return list of lists for a group
	    
	})
	
	socket.on('deleteTask', (listID, taskID, userID) => {
	    //TODO: remove task from database
	})

	socket.on('deleteList', (groupID, listID) => {
	    //TODO: delete list from database
	})
	
	socket.on('deleteGroup', (groupID, userID) => {
	    //TODO: delete group from database
	    dbfunc.deleteGroup(groupID);
	})
	
	socket.on('addTask', (groupID, listID, value) => {
	    var taskID = dbfunc.addTask(database, groupID, listID, value);
	    err = true;
	    if(err){
		console.log("could not insert into database")
		io.emit('error', 'could not insert into database');
	    } else {
		console.log("succesfull")
		io.in(listID).emit('successful add', taskID);
	    }
	})

	socket.on('createList', (groupID, value) => {
	    //TODO: Add list to database
	    var listID = dbfunc.createList(database, groupID, value);
	    io.emit('createList', listID);
	})
	
	socket.on('createGroup', (userID, groupName) => {
	    (async () => {
		try{
		    var groupID = await dbfunc.createGroup(database, userID, groupName);
		    console.log(groupID);
		    io.emit('createGroup', groupID);
		} catch(e) {
		    console.log(e);
		    io.emit('error', e);
		}
	    })();
	})
	
	socket.on('checkTask', (listID, taskID, userID) => {
	    //TODO: check a task given an ID
	})
	
	socket.on('uncheckTask', (listID, taskID, userID) => {
	    //TODO: uncheck a task given an ID
	})
	
	socket.on('editTask', (listID, taskID, userID,  value) => {
	    //TODO: Edit a task given and ID and new value
	})

	socket.on('editList', (groupID, listID, newName) => {
	    //TODO: Edit a list given and ID and new value
	})

	
	socket.on('editGroup', (/*groupID, value*/) => {
	    //TODO: Edit a group given and ID and new value
	})

	socket.on('inviteUser', (groupID, userID) => {
	    //TODO: invite user to group
	})
	
	socket.on('leaveGroup', (groupID, userID) => {
	    //TODO: remove user from group
	})
	
	socket.on('disconnect',  () => {
	    console.log('A user disconnected');
	});
	
	async function hash_password(user, password){
	    const hash3 = await bcrypt.hash(password, salt) 
	    user = users.find(x => x.name == user)
	    user['passwordhash'] = hash3;
	}
	
	async function compare_passwords(passwordhash, password){
	    const res = await bcrypt.compare(password, passwordhash);
	    return res;
	}

	async function authenticate(username, password){
	    const found = users.find(x => x.name == username);
	    if(!found){
		console.log('user does not exist')
	    } else {
		const res = await compare_passwords(found['passwordhash'], password);
		//console.log(res);
		return res;
	    }
	}
    });
    db.close();
});


http.listen(3000, () => {
    console.log('listening on *:3000');
});
