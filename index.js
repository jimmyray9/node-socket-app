const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;
let users = {};

// Set up middleware if needed 
// app.set('view engine', 'pug');
// app.set('views', './views');
app.use(express.static(__dirname + '/public'));

// ***************** Set up socket connection for server **********************/
io.on('connection', function(socket) {
    console.log("New client connected:", socket.id);
    socket.on('new_user', function(name){
        let message = "";
        users[socket.id] = name;
        socket.broadcast.emit('msgToClient', {name: name, message: `${name} joined the chat`});
        Object.keys(users).length == 1 ? message = 'There is 1 user in the group' : message = `There are ${Object.keys(users).length} people in the group.`
        socket.emit('msgToClient', {name: "Room", message: message})
    })
    

    //Receiving msg from client - sends to all clients
    socket.on('msgFromClient', function(data) {
        io.emit("msgToClient", data);
    });

    socket.on('disconnect', function() {
        console.log(`User disconnected: ${socket.id}`);
        socket.broadcast.emit('msgToClient', {name: users[socket.id], message: 'User disconnected'});
        delete users[socket.id];
    })
});


//***************************App Routes******************************/
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//***************************Server setup ***************************/
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});