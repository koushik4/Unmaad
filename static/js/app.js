const socket = io()
const peer = new Peer({ key: 'peerjs', host: 'mypeer1.herokuapp.com', secure: true, port: 443 })
let isMute = false
let videoOn = false
let roomId = -1, id = -1;
peer.on("open", peerId => {
    id = peerId
    console.log(socket.rooms);
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        let video = document.createElement("video");
        video.id = id
        video.srcObject = stream
        video.muted = true
        video.addEventListener('loadedmetadata', () => {
            video.play()
          })
        document.getElementById("video-grid").appendChild(video)
    })
    socket.on("assignRoomId", rId => {
        roomId = rId
        console.log(roomId)
    })
    socket.on("RemoveThisUserFromServer", pId => {
        if(document.getElementById(pId) != null)
        document.getElementById(pId).remove()
    })
    socket.emit("addNewUserToRoom", peerId);
    socket.emit("Mute", roomId, id, isMute)
    socket.on("MuteThisUserFromServer", (pId, mute) => { 
        console.log("Status of ", pId,mute, "Status of mine ",isMute)
        if(document.getElementById(pId) != null)
        document.getElementById(pId).muted = mute
    })
    socket.on("open", (pid) => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            // console.log(peerId,id)
            let call = peer.call(pid, stream);
            let video = document.createElement("video");
            video.id = call.peer;
            call.on("stream", function (remoteStream) {
                console.log("Calling")
                addVideo(video, remoteStream)
            })
            call.on('close', () => {
                endCall()
            })
            // addVideo(stream)
        })
    })

    // socket.on("VideoToggleFromServer", (id, videoOn) => {
    //     console.log(videoOn);
    //     if (!videoOn) {
    //         console.log(document.getElementById(id))
    //         document.getElementById(id).pause()
    //     }
    //     else{ document.getElementById(id).play()}

    // })
    peer.on("call", call => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            call.answer(stream)
            // console.log("Call is {from} to {to}",call.peer,peerId)
            let video = document.createElement("video");
            video.id = call.peer;
            call.on("stream", function (remoteStream) {
                addVideo(video, remoteStream)
            })
            call.on('close', () => {
                endCall()
            })
        })
    })


})

socket.on("dis", (pId) => {
    console.log(socket.rooms)
    socket.emit("print", id);
})
function endCall() {
    console.log("jis");
    document.getElementById(id).remove();
}
function mute() {
    isMute = !isMute
    console.log(isMute)
    socket.emit("Mute", roomId, id, isMute)
}

function video() {
    videoOn = !videoOn
    socket.emit("VideoToggle", roomId, id, videoOn)
}
function addVideo(video, stream) {
    console.log("koushik");
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
      })
    document.getElementById("video-grid").appendChild(video)
}