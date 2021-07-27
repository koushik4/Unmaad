const express = require("express")
const app = express()
const {v4 : uuidv4} = require('uuid');
const url = require("url")
const socketio = require("socket.io")
const http = require("http")
const path = require("path")
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 5000;

let socketRooms = {}
let rooms = {}
let muteStatus = {}
app.use(express.static(path.join(__dirname, "static")));
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "static", "welcome.html"))
})
app.post("/", (req, res) => {
    let rId = uuidv4();
    rooms[rId] = []
    return res.redirect('/' + rId)
})
app.get("/:roomId", (req, res) => {
    if(Object.keys(rooms).indexOf(req.params.roomId) < 0)
    return res.redirect('/');
    return res.sendFile(path.join(__dirname, "static", "video.html"))
})
io.on("connection", socket => {
    socket.on("addNewUserToRoom", (peerId) => {
        let roomId = url.parse(socket.handshake.headers.referer).pathname.substring(1);
        socket.join(roomId);
        socketRooms[socket.id] = [peerId,roomId]
        if (rooms[roomId] == undefined) rooms[roomId] = []; 
        rooms[roomId].push(peerId);
        console.log(rooms[roomId].length)
        muteStatus[peerId] = true;
        socket.emit("assignRoomId", roomId)
        socket.to(roomId).emit("open", peerId);
    })
    socket.on("GetMuteStatus",(pId)=>{
        for(let i of Object.keys(muteStatus)){
            if(i!=pId){
            // console.log(i,muteStatus[i],"Mute status");
            socket.emit("MuteThisUserFromServer",i,muteStatus[i]);
            }
        }
    })
    socket.on("Mute",(roomId,peerId,mute)=>{    
        muteStatus[peerId] = mute
        socket.to(roomId).emit("MuteThisUserFromServer",peerId,mute);
    })
    socket.on("VideoToggle",(roomId,id,videoOn)=>{
        console.log("jsiojfdsofdsod");
        socket.to(roomId).emit("VideoToggleFromServer",id,videoOn)
    })
    socket.on("disconnect", () => { 
        if(socketRooms[socket.id]!=undefined)
        removeUser(socketRooms[socket.id][0],socketRooms[socket.id][1])
    })

    function removeUser(peerId,roomId) {
        if (rooms[roomId] != undefined) {
            let index = rooms[roomId].indexOf(peerId);
            // console.log(rooms[roomId],"hello",index)
            rooms[roomId].splice(index,1);
            console.log(rooms[roomId].length)
            if (rooms[roomId].length == 0) delete rooms[roomId];
            socket.to(roomId).emit("RemoveThisUserFromServer", peerId)
        }
    }
})

server.listen(port, () => {
    console.log("Listening to 5000")
})