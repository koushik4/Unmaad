const express = require("express")
const app = express()
const socketio = require("socket.io")
const http = require("http")
const path = require("path")
const server = http.createServer(app)
const io = socketio(server)
const port =  process.env.PORT || 5000 ;
let peerIds = []
app.use(express.static(path.join(__dirname, "static")));
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "static", "index.html"))
})
io.on("connection", socket => {
    socket.on("hi", (peerId) => {
        socket.broadcast.emit("open",peerId);
    })
    socket.on("hello",()=>{console.log("jdos")})

})
server.listen(port, () => {
    console.log("Listening to 5000")
})