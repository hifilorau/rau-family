'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface MusicPlayerProps {
	audioUrl: string;
	thumbnailUrl: string;
	title: string;
}

export default function MusicPlayer({ audioUrl, thumbnailUrl, title }: MusicPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

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

	const rewind = () => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
		}
	};

	const toggleMute = () => {
		if (audioRef.current) {
			audioRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.addEventListener('ended', () => setIsPlaying(false));
			return () => {
				if (audioRef.current) {
					audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
				}
			};
		}
	}, []);

	return (
		<Card className="fixed bottom-4 right-4 p-4 w-64 bg-background/95 backdrop-blur-sm shadow-lg">
			<div className="flex flex-col gap-4">
				<div className="relative w-full aspect-square">
					<Image
						src={thumbnailUrl}
						alt={title}
						fill
						className="rounded-md object-cover"
					/>
				</div>
				
				<div className="text-sm font-medium truncate">{title}</div>
				
				<div className="flex justify-between items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={rewind}
					>
						<SkipBack className="h-4 w-4" />
					</Button>
					
					<Button
						variant="default"
						size="icon"
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
			
			<audio
				ref={audioRef}
				src={audioUrl}
				preload="metadata"
			/>
		</Card>
	);
}