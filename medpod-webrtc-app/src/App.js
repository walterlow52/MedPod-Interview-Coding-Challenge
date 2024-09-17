import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3000');

function App() {
  const [stream, set_stream] = useState(null);
  const [peer, set_peer] = useState(null);
  const user_audio = useRef();
  const peer_audio = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((userStream) => {
      set_stream(userStream);
      user_audio.current.srcObject = userStream;
    });

    socket.on('signal', (data) => {
      if (peer) {
        peer.signal(data);
      }
    });
  }, []);

  const create_peer = () => {
    const new_peer = new Peer({ initiator: true, trickle: false, stream });
    new_peer.on('stream', (stream) => {
      peer_audio.current.srcObject = stream;
    });
    set_peer(new_peer);
  };

  const join_peer = () => {
    const new_peer = new Peer({ initiator: false, trickle: false, stream });
    new_peer.on('signal', (data) => {
      socket.emit('signal', data);
    });

    new_peer.on('stream', (stream) => {
      peer_audio.current.srcObject = stream;
    });

    set_peer(new_peer);
  };

  return (
    <div>
      <h1> MedPod WebRTC Application </h1>
      <audio ref = {user_audio} controls autoplay />
      <audio ref = {peer_audio} controls autoplay />
      <button onclick = {create_peer}> CALL </button>
      <button onclick = {join_peer}> JOIN CALL </button>
    </div>
  );
}

export default App;