const express = require("express")
const app = express()
const url = require("url")
const socketio = require("socket.io")
const http = require("http")
const path = require("path")
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 5000;

let socketRooms = {}
let roomId = 0
let rooms = {}
app.use(express.static(path.join(__dirname, "static")));
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "static", "welcome.html"))
})
app.post("/", (req, res) => {
    let rId = roomId;
    roomId++;
    return res.redirect('/' + rId)
})
app.get("/:roomId", (req, res) => {
    return res.sendFile(path.join(__dirname, "static", "video.html"))
})
io.on("connection", socket => {
    socket.on("addNewUserToRoom", (peerId) => {
        let roomId = url.parse(socket.handshake.headers.referer).pathname.substring(1);
        socket.join(roomId);
        socketRooms[socket.id] = [peerId,roomId]
        if (rooms[roomId] == undefined) rooms[roomId] = [];
        rooms[roomId].push(peerId);
        console.log(socket.id,socket.rooms);
        socket.emit("assignRoomId", roomId)
        socket.to(roomId).emit("open", peerId);
    })
    
    socket.on("RemoveThisUser", (peerId, roomId) => {
        console.log(socket.rooms)
        removeUser(peerId, roomId)
    })

    socket.on("MuteThisUser",(roomId,peerId,mute)=>{
        console.log("muteeee");
        socket.to(roomId).emit("MuteThisUserFromServer",peerId,mute);
    })
    socket.on("VideoToggle",(roomId,id,videoOn)=>{
        console.log("jsiojfdsofdsod");
        socket.to(roomId).emit("VideoToggleFromServer",id,videoOn)
    })
    socket.on("disconnect", () => { 
        console.log(socketRooms[socket.id]);
        removeUser(socketRooms[socket.id][0],socketRooms[socket.id][1])
    })

    function removeUser(peerId,roomId) {
        if (rooms[roomId] != undefined) {
            console.log(rooms,peerId)
            let index = rooms[roomId].indexOf(peerId);
            rooms[roomId].splice(index);
            if (rooms[roomId].length == 0) delete rooms[roomId];
            console.log(socket.rooms)
            socket.to(roomId).emit("RemoveThisUserFromServer", peerId)
        }
    }
})

server.listen(port, () => {
    console.log("Listening to 5000")
})