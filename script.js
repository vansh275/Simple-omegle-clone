//alert("on");
const socket = io();
var localVideo;
var remoteVideo;
var peerConnection;
const callBTN= document.getElementById('call-btn');
const configuration = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };
async function start() {

    peerConnection = await new RTCPeerConnection(configuration);

    peerConnection.addEventListener('connectionstatechange', event => {
        console.log("connection changed");
        if (peerConnection.connectionState === 'connected') {
            console.log("ho gaya bhaya");
        }
        if (peerConnection.iceConnectionState === 'disconnected') {
            console.log("gone");
            alert("Disconnected");
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
    callBTN.addEventListener('click',call);
}

async function call() {
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

socket.on('userLeft', () => {
    alert('userLeft');
})

// // async function userLeft(){
// //     socket.emit('userLeft');
// // }
// document.onvisibilitychange = () => {
//     // if (document.visibilityState === "hidden") {
//     //   navigator.sendBeacon("/log", analyticsData);
//     // }
//     socket.emit('userLeft');
//   };
async function hangUp() {
    socket.emit('userLeft');
}
window.addEventListener('load', start);

//screen size adjustment

// const ourVideo=document.getElementById('ourVideo');
// const remoteVideo=document.getElementById('remoteVideo');
// function addCenterClass() {
//     if (window.innerWidth <= 700) {
//         ourVideo.classList.add('text-center');
//         remoteVideo.classList.add('text-center');
//     } else {
//         ourVideo.classList.remove('text-center');
//         remoteVideo.classList.remove('text-center');
//     }
// }
window.onresize = addCenterClass;

//window.addEventListener('beforeunload',userLeft);





