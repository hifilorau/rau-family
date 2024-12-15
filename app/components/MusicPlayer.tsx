'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface Track {
	id: string;
	name: string;
	songUrl: string;
	imageUrl: string;
	artist: string;
}

export default function MusicPlayer() {
	const [tracks, setTracks] = useState<Track[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const currentTrack = tracks[currentTrackIndex];
	const togglePlay = () => {

		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const playNextTrack = () => {
		const nextIndex = (currentTrackIndex + 1) % tracks.length;
		setCurrentTrackIndex(nextIndex);
		setIsPlaying(true);
	};

	const playPreviousTrack = () => {
		const previousIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
		setCurrentTrackIndex(previousIndex);
		setIsPlaying(true);
	};

	const toggleMute = () => {
		if (audioRef.current) {
			audioRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	

	useEffect(() => {
		const fetchTracks = async () => {
			try {
				const response = await fetch('/api/tracks');
				if (!response.ok) throw new Error('Failed to fetch tracks');
				const fetchedTracks = await response.json();
				setTracks(fetchedTracks);
			} catch (error) {
				console.error('Error fetching tracks:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTracks();
	}, []);

	useEffect(() => {
		if (audioRef.current && isPlaying) {
			audioRef.current.play();
		}
	}, [currentTrackIndex, isPlaying]);

	useEffect(() => {
		if (!audioRef.current) return;
		
		audioRef.current.addEventListener('ended', playNextTrack);
		return () => {
			if (audioRef.current) {
				audioRef.current.removeEventListener('ended', playNextTrack);
			}
		};
	}, [currentTrackIndex]);

	// Render loading state
	if (isLoading) {
		return (
			<Card className="fixed bottom-4 right-4 p-4 w-[480px] bg-black/80 backdrop-blur-sm border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] z-20">
				<div className="flex items-center justify-center p-4">
					<Loader2 className="h-6 w-6 animate-spin text-white" />
					<span className="ml-2 text-white">Loading tracks...</span>
				</div>
			</Card>
		);
	}

	// Return null if no tracks
	if (!tracks.length || !currentTrack) {
		return null;
	}

	return (
		<Card className="fixed bottom-4 right-4 p-4 w-[480px] bg-black/80 backdrop-blur-sm border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] z-20">
			<div className="flex items-center gap-4">
				{/* Thumbnail */}
				<div className="relative w-16 h-16 flex-shrink-0">
					<Image
						src={currentTrack.imageUrl}
						alt={currentTrack.name}
						fill
						className="rounded-md object-cover"
					/>
				</div>
				
				<div className="flex-1 min-w-0">
					{/* Track Info */}
					<div className="space-y-1 mb-2">
						<div className="text-sm font-medium truncate text-white">{currentTrack.name}</div>
						<div className="text-xs truncate text-white/70">{currentTrack.artist}</div>
					</div>
					
					{/* Controls */}
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-white/10 text-white"
							onClick={playPreviousTrack}
						>
							<SkipBack className="h-4 w-4" />
						</Button>
						
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
							onClick={togglePlay}
						>
							{isPlaying ? (
								<Pause className="h-4 w-4" />
							) : (
								<Play className="h-4 w-4" />
							)}
						</Button>

						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-white/10 text-white"
							onClick={playNextTrack}
						>
							<SkipForward className="h-4 w-4" />
						</Button>
						
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:bg-white/10 text-white ml-auto"
							onClick={toggleMute}
						>
							{isMuted ? (
								<VolumeX className="h-4 w-4" />
							) : (
								<Volume2 className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</div>
			
			<audio
				ref={audioRef}
				src={currentTrack.songUrl}
				preload="metadata"
			/>
		</Card>
	);
}