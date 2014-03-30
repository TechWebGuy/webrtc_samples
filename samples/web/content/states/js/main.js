var localStream, localPeerConnection, remotePeerConnection;

var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangupButton = document.getElementById("hangupButton");
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

var total = '';
function trace(text) {
  total += text;
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

btn1.disabled = false;
btn2.disabled = true;
btn3.disabled = true;
var pc1,pc2;
var localstream;
var sdpConstraints = {'mandatory': {
                        'OfferToReceiveAudio':true,
                        'OfferToReceiveVideo':true }};

function gotStream(stream){
  trace("Received local stream");
  // Call the polyfill wrapper to attach the media stream to this element.
  attachMediaStream(vid1, stream);
  localstream = stream;
  btn2.disabled = false;
}

function start() {
  trace("Requesting local stream");
  btn1.disabled = true;
  // Call into getUserMedia via the polyfill (adapter.js).
  getUserMedia({audio:true, video:true},
                gotStream, function() {});
}

function call() {
  btn2.disabled = true;
  btn3.disabled = false;
  trace("Starting call");
  videoTracks = localstream.getVideoTracks();
  audioTracks = localstream.getAudioTracks();
  if (videoTracks.length > 0)
    trace('Using Video device: ' + videoTracks[0].label);
  if (audioTracks.length > 0)
    trace('Using Audio device: ' + audioTracks[0].label);
  var servers = null;
  var pc_constraints = {"optional": []};

  pc1 = new RTCPeerConnection(servers,pc_constraints);
  trace("Created local peer connection object pc1");
  document.getElementById("pc1-state").value = pc1.signalingState ||
                                               pc1.readyState;
  if (typeof pc1.onsignalingstatechange !== 'undefined') {
    pc1.onsignalingstatechange = stateCallback1;
  } else {
    pc1.onstatechange = stateCallback1;
  }
  document.getElementById("pc1-ice-connection-state").value =
                                                      pc1.iceConnectionState;
  if (typeof pc1.oniceconnectionstatechange !== 'undefined') {
    pc1.oniceconnectionstatechange = iceStateCallback1;
  } else {
    pc1.onicechange = iceStateCallback1;
  }
  pc1.onicecandidate = iceCallback1;

  pc2 = new RTCPeerConnection(servers,pc_constraints);
  trace("Created remote peer connection object pc2");
  document.getElementById("pc2-state").value = pc2.signalingState ||
                                               pc2.readyState;
  if (typeof pc2.onsignalingstatechange !== 'undefined') {
    pc2.onsignalingstatechange = stateCallback2;
  } else {
    pc2.onstatechange = stateCallback2;
  }
  document.getElementById("pc2-ice-connection-state").value =
                                                      pc2.iceConnectionState;
  if (typeof pc2.oniceconnectionstatechange !== 'undefined') {
    pc2.oniceconnectionstatechange = iceStateCallback2;
  } else {
    pc2.onicechange = iceStateCallback2;
  }
  pc2.onicecandidate = iceCallback2;
  pc2.onaddstream = gotRemoteStream;
  pc1.addStream(localstream);
  trace("Adding Local Stream to peer connection");
  pc1.createOffer(gotDescription1, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function gotDescription1(desc) {
  pc1.setLocalDescription(desc);
  trace("Offer from pc1 \n" + desc.sdp);
  pc2.setRemoteDescription(desc);
  pc2.createAnswer(gotDescription2, onCreateSessionDescriptionError,
                   sdpConstraints);
}

function gotDescription2(desc) {
  pc2.setLocalDescription(desc);
  trace("Answer from pc2 \n" + desc.sdp);
  pc1.setRemoteDescription(desc);
}

function hangup() {
  trace("Ending call");
  pc1.close();
  pc2.close();
  document.getElementById("pc1-state").value += "->" +
                                                pc1.signalingState ||
                                                pc1.readyState;
  document.getElementById("pc2-state").value += "->" +
                                                pc2.signalingState ||
                                                pc2.readyState;
  document.getElementById("pc1-ice-connection-state").value += "->" +
                                                        pc1.iceConnectionState;
  document.getElementById("pc2-ice-connection-state").value += "->" +
                                                        pc2.iceConnectionState;
  pc1 = null;
  pc2 = null;
  btn3.disabled = true;
  btn2.disabled = false;
}

function gotRemoteStream(e){
  attachMediaStream(vid2, e.stream);
  trace("Received remote stream");
}

function stateCallback1() {
  var state;
  if (pc1) {
    state = pc1.signalingState || pc1.readyState;
    trace("pc1 state change callback, state:" + state);
    document.getElementById("pc1-state").value += "->" + state;
  }
}

function stateCallback2() {
  var state;
  if (pc2) {
    state = pc2.signalingState || pc2.readyState;
    trace("pc2 state change callback, state:" + state);
    document.getElementById("pc2-state").value += "->" + state;
  }
}

function iceStateCallback1() {
  var iceState;
  if (pc1) {
    iceState = pc1.iceConnectionState;
    trace("pc1 ICE connection state change callback, state:" + iceState);
    document.getElementById("pc1-ice-connection-state").value += "->" +
                                                                 iceState;
  }
}

function iceStateCallback2() {
  var iceState;
  if (pc2) {
    iceState = pc2.iceConnectionState;
    trace("pc2 ICE connection state change callback, state:" + iceState);
    document.getElementById("pc2-ice-connection-state").value += "->" +
                                                                 iceState;
  }
}

function iceCallback1(event){
  if (event.candidate) {
    pc2.addIceCandidate(new RTCIceCandidate(event.candidate),
                        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace("Local ICE candidate: \n" + event.candidate.candidate);
  } else {
    trace("end of candidates1");
  }
}

function iceCallback2(event){
  if (event.candidate) {
    pc1.addIceCandidate(new RTCIceCandidate(event.candidate),
                        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace("Remote ICE candidate: \n " + event.candidate.candidate);
  } else {
    trace("end of candidates2");
  }
}

function onAddIceCandidateSuccess() {
  trace("AddIceCandidate success.");
}

function onAddIceCandidateError(error) {
  trace("Failed to add Ice Candidate: " + error.toString());
}
