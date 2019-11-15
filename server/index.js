import authenticate from './auth.js';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bcrypt = require('bcrypt');

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.on('connection', socket => {
    console.log('A user connected');
    socket.on('authenticate', (username, password) => {
	if(!username){
	    io.emit('error', 'missing username');
	}
	if(!password){
	    io.emit('error', 'missing password');
	}
	else{
	    authenticate(username,password);
	    if(true){
		io.emit('success', 'Authentication succesful');
	    } else {
		io.emit('error', 'Autentication failed')
	    }
	}
	    
    })
    
    socket.on('join list', listID => {
	socket.join(listID);
	console.log(listID);
	io.in(listID).emit('has joined', 'A user has joined the list-room: ' + listID);
    })

    socket.on('join group', groupID => {
	socket.join(groupID);
	console.log(groupID);
	io.in(groupID).emit('has joined', 'A user has joined the group-room: ' + groupID);
    })
    
    socket.on('chat message', (msg, group) => {
	io.in(group).emit('message', msg);
	console.log('Message: ', msg);
    })
    
    socket.on('delete task', (/*taskID */) => {
	//TODO: remove task from database
    })

    socket.on('delete list', (/*listID */) => {
	//TODO: delete list from database
    })
  
    socket.on('delete group', (/*groupID */) => {
	//TODO: delete group from database
    })
   
    socket.on('add task', (value, listID) => {
	//TODO: Add list to database
	//..
	err = true;
	if(err){
	    console.log("could not insert into database")
	    io.emit('error', 'could not insert into database');
	} else {
	    console.log("succesfull")
	    io.in(listID).emit('successful add', /* values to send to all clients on add*/);
	}
    })

    socket.on('add list', (/*value */) => {
	//TODO: Add list to database
    })
    
    socket.on('add group', (/*value */) => {
	//TODO: Add group to database
    })
    
    socket.on('check task', (/*taskID */) => {
	//TODO: check a task given an ID
    })
  
    socket.on('uncheck task', (/*taskID */) => {
	//TODO: uncheck a task given an ID
    })
    
    socket.on('edit task', (/*taskID, value*/) => {
	//TODO: Edit a task given and ID and new value
    })

    socket.on('edit list', (/*listID, value*/) => {
	//TODO: Edit a list given and ID and new value
    })

    
    socket.on('edit group', (/*groupID, value*/) => {
	//TODO: Edit a group given and ID and new value
    })

    
    socket.on('disconnect',  () => {
	console.log('A user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
