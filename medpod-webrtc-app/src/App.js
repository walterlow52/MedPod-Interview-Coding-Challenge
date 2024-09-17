import React from 'react';
import VideoPlayer from './components/VideoPlayer';
import Options from './components/Options';
import Notifications from './components/Notifications';

function App() {
  return (
    <div className = "App">
      <h1> MedPod WebRTC Application </h1>
      <VideoPlayer />
      <Options />
      <Notifications />
    </div>
  );
}

export default App;