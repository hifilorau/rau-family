import React, { useEffect, RefObject } from 'react';

interface AudioVisualizerProps {
  audioRef: RefObject<HTMLAudioElement>;
  audioContext: AudioContext;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef, audioContext }) => {
  useEffect(() => {
    if (!audioRef.current) return;

    let source: MediaElementAudioSourceNode | null = null;

    try {
      if (!audioRef.current.dataset.connected) {
        source = audioContext.createMediaElementSource(audioRef.current);
        audioRef.current.dataset.connected = 'true';

        // Connect the source directly to the destination to ensure playback
        source.connect(audioContext.destination);
      }
    } catch (error) {
      console.error('Error setting up audio source:', error);
    }

    return () => {
      if (source) {
        source.disconnect();
      }
    };
  }, [audioRef, audioContext]);

  return null; // No visualization logic yet
};

export default AudioVisualizer;
