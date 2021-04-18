const socket = io('/'); // because our server is setup at root path '/'
const videoGrid = document.getElementById('video-grid');

// setting up the connection to the peer server
// first param is undefined because i want the server to take care of generating a new id
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
// peer server is going to take all of the webrtc information of a user and generate a unique client id for that user, which can be used to connect with other peers on the network

const mypeers = {}
const myVideo = document.createElement('video');
myVideo.muted = true; // because we don't want to listen to our own video

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => { // stream -> our video and our audio
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);   
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        }) 
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    })
})

socket.on('user-disconnected', userId => {
  if (mypeers[userId]) mypeers[userId].close()
})

// as soon as we are connected to the peer server and get back an id, send that id,along with room_id to our server for setting up connection
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

function connectToNewUser(userId, stream){
    const call = peer.call(userId, stream); // calling the user with userId (in param) and sending them our audio and video stream

    const video = document.createElement('video')

    // and when user whom we have called and send our video stream to, sends their video stream we listen to that event and take in their video stream
    call.on('stream', userVideoStream => {
        // taking the stream from other users and adding it onto our own custom video element on our page
        addVideoStream(video, userVideoStream);
    })

    // removing video when someone closes the call
    call.on('close', () => {
        video.remove();
    })

    mypeers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream // this will allow us to play our video
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    // adding video to our video-grid
    videoGrid.append(video);
}