'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  songUrl: string;
  imageUrl: string;
  artist: string;
}

// Fetch and Decode Audio helper function
const fetchAndDecodeAudio = async (url: string, audioContext: AudioContext): Promise<AudioBuffer> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
};

const AudioPlayer: React.FC<{}> = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const gainNode = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number>();

  const cleanup = () => {
    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
      setSourceNode(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const handleNextTrack = () => {
    cleanup();
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  const handlePreviousTrack = () => {
    cleanup();
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
  };

  const togglePlay = async () => {
    if (!audioContext.current || !tracks[currentTrackIndex]) return;

    if (isPlaying) {
      cleanup();
      return;
    }

    try {
      // Resume AudioContext if it's suspended
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      const buffer = await fetchAndDecodeAudio(tracks[currentTrackIndex].songUrl, audioContext.current);
      const source = audioContext.current.createBufferSource();
      source.buffer = buffer;

      cleanup(); // Ensure any existing playback is stopped

      // Connect source through gain node to analyser and destination
      source.connect(gainNode.current!);
      gainNode.current!.connect(analyser!);
      analyser!.connect(audioContext.current.destination);

      // Set initial volume
      gainNode.current!.gain.value = isMuted ? 0 : volume;

      // Handle track ending
      source.onended = () => {
        cleanup();
      };

      setSourceNode(source);
      source.start(0);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      cleanup();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNode.current) {
      gainNode.current.gain.value = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNode.current) {
      gainNode.current.gain.value = !isMuted ? 0 : volume;
    }
  };


  // Initialize AudioContext and AnalyserNode
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/tracks');
        if (!response.ok) throw new Error('Failed to fetch tracks');
        const fetchedTracks = await response.json();
        setTracks(fetchedTracks);
        setCurrentTrackIndex(Math.floor(Math.random() * fetchedTracks.length));
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize audio context and nodes
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = audioContext.current.createAnalyser();
      analyserNode.fftSize = 256; // For better visualization performance
      gainNode.current = audioContext.current.createGain();
      setAnalyser(analyserNode);
    }

    fetchTracks();

    // Cleanup function
    return () => {
      if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (gainNode.current) {
        gainNode.current.disconnect();
      }
      if (analyser) {
        analyser.disconnect();
      }
    };
  }, []); // Empty dependency array since we only want this to run once

  // Visualization Logic
  useEffect(() => {
    if (!analyser || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / analyser.frequencyBinCount) * 1.5;
      let x = 0;

      for (let i = 0; i < analyser.frequencyBinCount; i++) {
        // Apply exponential scaling for more dramatic effect
        const scaleFactor = 1;
        const barHeight = Math.pow(dataArray[i] / 255, scaleFactor) * canvas.height;
        
        // Create more vibrant color variations based on frequency
        const hue = (i / analyser.frequencyBinCount) * 30 + 180; // Narrow the hue range to cooler tones
        const saturation = 10 + (barHeight / canvas.height) * 20; // Keep saturation low for white-like colors
        const lightness = 70 + (barHeight / canvas.height) * 20; // // Adjust lightness with amplitude
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analyser, isPlaying]);

  // Effect to handle track changes
  useEffect(() => {
    if (currentTrackIndex >= 0 && isPlaying) {
      togglePlay();
    }
  }, [currentTrackIndex]);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg" style={{ zIndex: 20, maxWidth: '600px' }}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col">
          <div className="w-full">
            {tracks[currentTrackIndex] && (
              <div className="flex items-center gap-4">
                <img 
                  src={tracks[currentTrackIndex].imageUrl} 
                  alt={tracks[currentTrackIndex].name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="min-w-[120px]">
                  <p className="font-bold text-sm">{tracks[currentTrackIndex].name}</p>
                  <p className="text-gray-300 text-xs">{tracks[currentTrackIndex].artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePreviousTrack}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Previous track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={handleNextTrack}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Next track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 accent-white"
                  />
                </div>
              </div>
            )}
            <canvas ref={canvasRef} width="600" height="50" className="w-full mt-2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;