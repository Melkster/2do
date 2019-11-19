var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

var readline = require('readline-sync');


// Add a connect listener
socket.on('connect', socket => {
    console.log('Connected!');
});



//var group = readline.question("what room to join: ")
///socket.emit('join group', group);
socket.on('has joined', msg => {
    console.log(msg);
});
socket.on('message', msg => {
    console.log(msg);
});

socket.on('error', msg => {
    console.log(msg);
});

socket.on('success', msg => {
    console.log(msg);
});


//socket.emit('chat message', readline.question("any message to the group? "), group);
socket.emit('addTask', '5dd3bb4e0050af10677cb463', '5dd3bc3f9500331078a5dd83', readline.question("what task to add? "));
socket.emit('authenticate', '', 'melkersuger');

