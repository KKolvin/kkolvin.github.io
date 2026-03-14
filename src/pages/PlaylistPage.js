import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_PLAYLIST } from '../data/playlist';
import { useMusic } from '../context/MusicContext';

function PlaylistPage() {
    const { playTrack, togglePlay, currentTrack, isPlaying } = useMusic();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <section className="playlist-page">
            <div id="playlist-intro" className="playlist-intro">
                <h2 className="playlist-heading">View My Playlist</h2>
                <Link className="scroll-up scroll-up--playlist" to="/" aria-label="Go to home">
                    <span className="scroll-up-dot" aria-hidden="true" />
                </Link>
            </div>
            <div id="playlist-section" className="playlist-section">
                <div className="playlist-grid">
                    {DEFAULT_PLAYLIST.map((track) => {
                        const isCurrentTrack = currentTrack?.src === track.src;
                        const showPause = isCurrentTrack && isPlaying;
                        return (
                            <div
                                key={track.src}
                                className="playlist-card"
                                onClick={() => playTrack(track)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playTrack(track); } }}
                                role="button"
                                tabIndex={0}
                            >
                                <div
                                    className="playlist-card-art"
                                    style={track.artwork ? { backgroundImage: `url(${encodeURI(track.artwork)})`, backgroundSize: 'cover' } : undefined}
                                />
                                <div className="playlist-card-info">
                                    <span className="playlist-card-title">{track.title}</span>
                                    <span className="playlist-card-artist">{track.artist}</span>
                                </div>
                                <button
                                    type="button"
                                    className="playlist-card-play-btn"
                                    aria-label={showPause ? 'Pause' : 'Play'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (showPause) togglePlay();
                                        else playTrack(track);
                                    }}
                                >
                                    {showPause ? (
                                        <span className="playlist-card-icon-pause" />
                                    ) : (
                                        <span className="playlist-card-icon-play" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default PlaylistPage;
