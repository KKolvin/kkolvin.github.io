import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MusicContext } from '../../context/MusicContext';

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

import { DEFAULT_PLAYLIST } from '../../data/playlist';

export default function MusicPlayer({ playlist = DEFAULT_PLAYLIST }) {
    const { playTrackRef, togglePlayRef, setMusicState } = useContext(MusicContext) ?? {};
    const [position, setPosition] = useState(getDefaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledPlaylist, setShuffledPlaylist] = useState(() => shuffleArray(playlist));
    const [titleOverflows, setTitleOverflows] = useState(false);

    const audioRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const widgetRef = useRef(null);
    const trackNameRef = useRef(null);
    const trackNameMeasureRef = useRef(null);

    const tracks = shuffledPlaylist.length > 0 ? shuffledPlaylist : playlist;
    const currentTrack = tracks[currentIndex] || tracks[0];

    const checkTitleOverflow = () => {
        const container = trackNameRef.current;
        const measure = trackNameMeasureRef.current;
        if (!container || !measure || container.clientWidth === 0) return;
        setTitleOverflows(measure.offsetWidth > container.clientWidth);
    };

    useEffect(() => {
        checkTitleOverflow();
        const container = trackNameRef.current;
        if (!container) return;
        const ro = new ResizeObserver(checkTitleOverflow);
        ro.observe(container);
        return () => ro.disconnect();
    }, [currentTrack?.title]);

    useEffect(() => {
        if (tracks.length === 0) return;

        const track = tracks[currentIndex];
        if (!track) return;

        const audio = new Audio(encodeURI(track.src));
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

        let resumeHandler = null;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                setIsPlaying(false);
                resumeHandler = () => {
                    audio.play().then(() => setIsPlaying(true)).catch(() => {});
                };
                document.addEventListener('click', resumeHandler, { once: true });
                document.addEventListener('touchstart', resumeHandler, { once: true });
                document.addEventListener('keydown', resumeHandler, { once: true });
            });
        }

        return () => {
            if (resumeHandler) {
                document.removeEventListener('click', resumeHandler);
                document.removeEventListener('touchstart', resumeHandler);
                document.removeEventListener('keydown', resumeHandler);
            }
            audio.pause();
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentIndex, tracks, playlist]);

    const canStartDrag = (target) =>
        !target?.closest('.music-player-ctrl') && !target?.closest('.music-player-progress-wrap');

    const handlePointerDown = (e) => {
        if (!canStartDrag(e.target)) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e) => {
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        };

        const handlePointerUp = () => setIsDragging(false);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
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

    const playTrack = useCallback((track) => {
        setCurrentIndex((prev) => {
            const idx = tracks.findIndex((t) => t.src === track.src);
            return idx >= 0 ? idx : prev;
        });
        setProgress(0);
        setIsPlaying(true);
    }, [tracks]);

    useEffect(() => {
        if (playTrackRef) playTrackRef.current = playTrack;
        if (togglePlayRef) togglePlayRef.current = togglePlay;
        return () => {
            if (playTrackRef) playTrackRef.current = null;
            if (togglePlayRef) togglePlayRef.current = null;
        };
    }, [playTrackRef, togglePlayRef, playTrack, togglePlay]);

    useEffect(() => {
        if (setMusicState) {
            setMusicState({ currentTrack, isPlaying });
        }
    }, [currentTrack, isPlaying, setMusicState]);

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
            onPointerDown={handlePointerDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="music-player-body">
                <div
                    key={currentTrack?.src ?? currentIndex}
                    className="music-player-art"
                    style={currentTrack?.artwork ? { backgroundImage: `url(${encodeURI(currentTrack.artwork)})`, backgroundSize: 'cover' } : undefined}
                />
                <div className="music-player-info-wrap">
                    <div className="music-player-info">
                        <div className="music-player-track-name" ref={trackNameRef}>
                            <span ref={trackNameMeasureRef} className="music-player-track-name-measure" aria-hidden="true">{currentTrack?.title}</span>
                            {titleOverflows ? (
                                <span className="music-player-marquee music-player-marquee--scroll"><span>{currentTrack?.title}</span> &nbsp; <span>{currentTrack?.title}</span></span>
                            ) : (
                                <span className="music-player-track-name-static">{currentTrack?.title}</span>
                            )}
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
