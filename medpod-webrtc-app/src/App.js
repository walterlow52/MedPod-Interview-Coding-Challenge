import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3000');

function App() {
// Step 1: Simple WebRTC Audio Streaming Application Setup
  const [stream, set_stream] = useState(null);
  const [peer, set_peer] = useState(null);
  const user_audio = useRef();
  const peer_audio = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audioContext: true }).then((userStream) => {
      set_stream(userStream);
      user_audio.current.srcObject = userStream;
    });

    socket.on('signal', (data) => {
      if (peer) {
        peer.signal(data);
      }
    });
  }, []);

// Step 2: Basic Audio Frequency Filter (Optional/Bonus)
useEffect(() => {
  if (stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const GainNode = audioContext.createGain();
    const BiquadFilter = audioContext.createBiquadFilter();

    GainNode.gain.value = 0.75;
    BiquadFilter.type = "lowpass";
    BiquadFilter.frequency.value = 200;

    source.connect(GainNode);
    GainNode.connect(BiquadFilter);
    BiquadFilter.connect(audioContext.destination);
  }
}, [stream]);

// Step 3: Audio Waveform Visualization Stream (Advanced/Extra Credit)
  useEffect(() => {
    if (stream) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const buffer = analyser.frequencyBinCount;
      const arr = new Uint8Array(buffer);
      const waveform = document.getElementById('waveform');
      const context = waveform.getContext('2d');

      function visuals() {
        requestAnimationFrame(visuals);
        analyser.getByteTimeDomainData(arr);
        context.fillStyle = 'rgb(200, 200, 200)';
        context.fillRect(0, 0, waveform.width, waveform.height);
        context.lineWidth = 2;
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.beginPath();

        const slice_width = (waveform.width * 1.0) / buffer;
        let a = 0;

        for (let i = 0; i < buffer; i++) {
          const x = arr[i] / 128.0;
          const y = (x * waveform.height) / 2;
          if (i === 0) {
            context.moveTo(a, y);
          }
          else {
            context.lineTo(a, y);
          }
          a += slice_width;
        }
        context.lineTo(waveform.width, waveform.height / 2);
        context.stroke();
      }
      visuals();
    }
  }, [stream]);


// Peer functions for Step 1
  const create_peer = () => {
    const new_peer = new Peer({ initiator: true, trickle: false, stream });
    new_peer.on('signal', (data) => {
      socket.emit('signal', data);
    });

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
  }

/*// Filter functions for Step 2
  const [filter, set_filter] = useState(true);

  const filter_toggle = () => {
    set_filter(!filter);
    if (filter) {
      GainNode.disconnect();
      BiquadFilter.disconnect();
    }
    else {
      source.connect(GainNode);
      GainNode.connect(BiquadFilter);
      BiquadFilter.connect(audioContext.destination);
    }
  }*/

  return (
    <div>
      <h1> MedPod WebRTC Application </h1>
      <audio ref = {user_audio} controls autoPlay />
      <audio ref = {peer_audio} controls autoPlay />
      <button onClick = {create_peer}> CALL </button>
      <button onClick = {join_peer}> JOIN CALL </button>
      {/* <button onClick = {filter_toggle}> {filter ? 'FILTER: OFF' : 'FILTER: ON'} </button> */}
      <canvas id = "waveform" width = "500" height = "500"></canvas>
    </div>
  );
}

export default App;