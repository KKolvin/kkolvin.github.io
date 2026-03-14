import React, { createContext, useContext, useRef, useState } from 'react';

export const MusicContext = createContext(null);

export function MusicProvider({ children }) {
    const [musicState, setMusicState] = useState({ currentTrack: null, isPlaying: false });
    const playTrackRef = useRef(null);
    const togglePlayRef = useRef(null);

    const value = {
        currentTrack: musicState.currentTrack,
        isPlaying: musicState.isPlaying,
        setMusicState,
        playTrackRef,
        togglePlayRef,
        playTrack: (track) => playTrackRef.current?.(track),
        togglePlay: () => togglePlayRef.current?.(),
    };

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const ctx = useContext(MusicContext);
    return {
        currentTrack: ctx?.currentTrack,
        isPlaying: ctx?.isPlaying ?? false,
        playTrack: ctx?.playTrack ?? (() => {}),
        togglePlay: ctx?.togglePlay ?? (() => {}),
    };
}
