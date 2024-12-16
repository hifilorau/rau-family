import React, { useEffect, RefObject } from 'react';

interface AudioVisualizerProps {
  audioRef: RefObject<HTMLAudioElement>;
  audioContext: AudioContext;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef, audioContext }) => {
  useEffect(() => {
    if (!audioRef.current || !audioContext) return;
  
    // Check if already connected to avoid re-triggering unnecessarily
    if (audioRef.current.dataset.connected === 'true') {
      console.log('Audio source already connected, skipping.');
      return;
    }
  
    let source: MediaElementAudioSourceNode | null = null;
  
    try {
      // Create the MediaElementAudioSourceNode and connect it
      source = audioContext.createMediaElementSource(audioRef.current);
      audioRef.current.dataset.connected = 'true';
      source.connect(audioContext.destination);
  
      console.log('Audio source connected to destination');
    } catch (error) {
      console.error('Error setting up audio source:', error);
    }
  
    return () => {
      // Only disconnect if source exists and cleanup is necessary
      if (source) {
        source.disconnect();
        console.log('Audio source disconnected');
      }
    };
  }, [audioRef.current, audioContext]);

  return <canvas id="audio-visualizer" width="600" height="200" />;
};

export default AudioVisualizer;
