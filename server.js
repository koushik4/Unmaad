const express = require("express")
const app = express()
const socketio = require("socket.io")
const http = require("http")
const path = require("path")
const server = http.createServer(app)
const io = socketio(server)
const port = 5000 || process.env.PORT;
let peerIds = []
app.use(express.static(path.join(__dirname, "static")));
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "static", "index.html"))
})
io.on("connection", socket => {
    socket.on("hi", (peerId) => {
        socket.broadcast.emit("open",peerId);
    })

})
server.listen(port, () => {
    console.log("Listening to 5000")
})