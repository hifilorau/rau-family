'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SnowEffect = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		if (!containerRef.current) return;

		// Scene setup
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);

		// Create snowflakes
		const snowflakes: THREE.Points[] = [];
		const snowflakeCount = 1000;
		const geometry = new THREE.BufferGeometry();
		const vertices = [];

		for (let i = 0; i < snowflakeCount; i++) {
			const x = Math.random() * 2000 - 1000;
			const y = Math.random() * 2000 - 1000;
			const z = Math.random() * 2000 - 1000;
			vertices.push(x, y, z);
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const material = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 4,
			transparent: true,
			opacity: 0.8,
		});

		const snow = new THREE.Points(geometry, material);
		scene.add(snow);
		snowflakes.push(snow);

		camera.position.z = 1000;

		// Animation
		const animate = () => {
			requestAnimationFrame(animate);

			snowflakes.forEach(flake => {
				flake.rotation.y += 0.001;
				const positions = flake.geometry.attributes.position.array;
				for (let i = 1; i < positions.length; i += 3) {
					positions[i] -= 1; // Move snowflakes down
					if (positions[i] < -1000) positions[i] = 1000; // Reset position when below screen
				}
				flake.geometry.attributes.position.needsUpdate = true;
			});

			renderer.render(scene, camera);
		};

		animate();

		// Handle resize
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);

		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
			if (containerRef.current) {
				containerRef.current.removeChild(renderer.domElement);
			}
			scene.remove(...snowflakes);
			geometry.dispose();
			material.dispose();
		};
	}, []);

	return <div ref={containerRef} className="fixed inset-0 pointer-events-none" />;
};

export default SnowEffect;