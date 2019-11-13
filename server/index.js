var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.on('connection', socket => {
    console.log('A user connected');
    
    socket.on('chat message', msg => {
	console.log('Message: ', msg);
    })
    
    socket.on('delete task' (/*taskID */) => {
	//TODO: remove task from database
    })

    socket.on('delete list' (/*listID */) => {
	//TODO: delete list from database
    })
  
    socket.on('delete group' (/*groupID */) => {
	//TODO: delete group from database
    })
   
    socket.on('add task' (/*value */) => {
	//TODO: Add list to database
    })

     socket.on('add list' (/*value */) => {
	//TODO: Add list to database
    })
    
    socket.on('add group' (/*value */) => {
	//TODO: Add group to database
    })
    
    socket.on('check task' (/*taskID */) => {
	//TODO: check a task given an ID
    })
  
    socket.on('uncheck task' (/*taskID */) => {
	//TODO: uncheck a task given an ID
    })
    
    socket.on('edit task' (/*taskID, value*/) => {
	//TODO: Edit a task given and ID and new value
    })

    socket.on('edit list' (/*listID, value*/) => {
	//TODO: Edit a list given and ID and new value
    })

    
    socket.on('edit group' (/*groupID, value*/) => {
	//TODO: Edit a group given and ID and new value
    })

    
    socket.on('disconnect',  () => {
	console.log('A user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
