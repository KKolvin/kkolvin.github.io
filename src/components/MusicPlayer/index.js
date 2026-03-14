import React, { useState, useRef, useEffect } from 'react';

function getDefaultPosition() {
    return {
        x: window.innerWidth * 0.12,
        y: window.innerHeight * 0.40,
    };
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const DEFAULT_PLAYLIST = [
    { src: '/audio/background.mp3', title: 'Your Song Title', artist: 'Artist Name' },
    // Add more tracks: { src: '/audio/track2.mp3', title: 'Track 2', artist: 'Artist' },
];

export default function MusicPlayer({ playlist = DEFAULT_PLAYLIST }) {
    const [position, setPosition] = useState(getDefaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledPlaylist, setShuffledPlaylist] = useState(() => shuffleArray(playlist));

    const audioRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const widgetRef = useRef(null);

    const tracks = shuffledPlaylist.length > 0 ? shuffledPlaylist : playlist;
    const currentTrack = tracks[currentIndex] || tracks[0];

    useEffect(() => {
        if (tracks.length === 0) return;

        const track = tracks[currentIndex];
        if (!track) return;

        const audio = new Audio(track.src);
        audio.loop = false;
        audioRef.current = audio;

        const updateProgress = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration);
                setProgress(audio.currentTime);
            }
        };

        const handleEnded = () => {
            const nextIndex = (currentIndex + 1) % tracks.length;
            if (nextIndex === 0) {
                setShuffledPlaylist(shuffleArray(playlist));
            }
            setCurrentIndex(nextIndex);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);
        audio.addEventListener('ended', handleEnded);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => setIsPlaying(false));
        }

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentIndex, tracks, playlist]);

    const handleMouseDown = (e) => {
        if (e.target.closest('.music-player-controls') || e.target.closest('.music-player-progress-wrap')) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        };

        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    const goPrev = () => {
        const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
        setCurrentIndex(prevIndex);
        setProgress(0);
    };

    const goNext = () => {
        const nextIndex = (currentIndex + 1) % tracks.length;
        if (nextIndex === 0) {
            setShuffledPlaylist(shuffleArray(playlist));
        }
        setCurrentIndex(nextIndex);
        setProgress(0);
    };

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = frac * duration;
        setProgress(audio.currentTime);
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

    const showControls = !isPlaying || isHovered;

    return (
        <div
            ref={widgetRef}
            className={`music-player-widget${showControls ? ' music-player-widget--show-controls' : ''}`}
            style={{ left: position.x, top: position.y }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="music-player-body">
                <div className="music-player-art" />
                <div className="music-player-info-wrap">
                    <div className="music-player-info">
                        <div className="music-player-track-name">
                            <span className="music-player-marquee"><span>{currentTrack?.title}</span> &nbsp; <span>{currentTrack?.title}</span></span>
                        </div>
                        <div className="music-player-artist-name">{currentTrack?.artist}</div>
                        <div className="music-player-controls">
                            <button type="button" className="music-player-ctrl music-player-prev" onClick={goPrev} aria-label="Previous">⏮</button>
                            <button
                                type="button"
                                className="music-player-ctrl music-player-play-pause"
                                onClick={togglePlay}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <span className="music-player-icon-pause" />
                                ) : (
                                    <span className="music-player-icon-play" />
                                )}
                            </button>
                            <button type="button" className="music-player-ctrl music-player-next" onClick={goNext} aria-label="Next">⏭</button>
                        </div>
                    </div>
                    <div
                        className="music-player-progress-wrap"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={duration}
                        onClick={handleProgressClick}
                    >
                        <div className="music-player-progress-track" />
                        <div className="music-player-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
