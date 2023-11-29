//alert("on");
const socket = io();
var localVideo;
var remoteVideo;
var peerConnection;
const configuration = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };
// var localStream;
// var remoteStream;
//window.addEventListener('load', makeCall);
async function start() {


    peerConnection = await new RTCPeerConnection(configuration);

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            console.log("ho gaya bhaya");
        }
    });

    localVideo = document.getElementById("local-video");
    remoteVideo = new MediaStream();

    const stream = await navigator.mediaDevices.getUserMedia({ "video": true, "audio": true });
    localVideo.srcObject = stream;
    stream.getTracks().forEach((track) => {
        console.log("giving track");
        peerConnection.addTrack(track, stream);
    })


    document.getElementById("remote-video").srcObject = remoteVideo;
    //remoteVideo.srcObject = new MediaStream();



    peerConnection.ontrack = async (e) => {
        console.log(e);
        if (e.streams && e.streams[0]) {
            e.streams[0].getTracks().forEach((track) => {
                remoteVideo.addTrack(track);
            });
        } else {
            console.error("No streams or stream[0] in the 'ontrack' event.");
        }
    };




    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            console.log("sending ice");
            socket.emit('ice-candidate', event.candidate);
        }
    }

    socket.on('ice-candidate', (data) => {
        peerConnection.addIceCandidate(data);
    })

    const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    }

    const offer = await peerConnection.createOffer(offerOptions);
    peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
    console.log(offer);

    socket.on('answer', async (data) => {
        console.log("got answer");
        const remoteDesc = new RTCSessionDescription(data);
        await peerConnection.setRemoteDescription(remoteDesc);
    });

    socket.on('offer', async (data) => {
        console.log("got offer");
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
        console.log("answer sent");
    });

}

window.addEventListener('load', start);





