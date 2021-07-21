const socket = io()
const peer = new Peer({key: 'peerjs', host: 'mypeer1.herokuapp.com', secure: true, port: 443})

console.log(peer)
peer.on("open", peerId => {
    console.log("fsinvsivsd");
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        let video = document.createElement("video");
        video.srcObject = stream
        video.muted = true
        video.play()
        document.getElementById("koushik").appendChild(video)
    })
    socket.emit("hi", peerId);
    socket.on("open", (id) => {
        console.log("people");
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            console.log("Calling...", id, peerId)
            let call = peer.call(id, stream);
            call.on("stream", function (remoteStream) {
                addVideo(remoteStream)
            })
            addVideo(stream)
        })
        console.log("helllo world");
    })

    peer.on("call", call => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            call.answer(stream)
            call.on("stream", function (remoteStream) {
                addVideo(remoteStream)
            })
        })
    })
})



function addVideo(stream) {
    let video = document.createElement("video");
    video.srcObject = stream
    video.play()
    document.getElementById("koushik").appendChild(video)
}