const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const {v4: uuidV4} = require("uuid");

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get("/:room", (req, res) => {
    res.render('room', {roomId: req.params.room})
})

// this runs any time someone connects to our webpage
io.on('connection', socket => {
    // this runs when someone connects to a room
    socket.on('join-room', (roomId, userId) => {
        // allowing current socket to join the room
        socket.join(roomId)
        // sending message to the other users in the room, current user is connected to
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(3000, function(){
    console.log("Server is listening on port 3000");
})