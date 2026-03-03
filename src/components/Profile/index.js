import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import profilePic from '../../assets/img/me-bright.png';
import '../../assets/styles/main.css';

const SUBTITLE = 'AI Infra · High-Performance Computing · Developer';

function Profile() {
    const [typed, setTyped] = useState('');
    const picRef = useRef(null);
    const holderRef = useRef(null);
    const bgRef = useRef(null);
    const targetRef = useRef({ x: 50, y: 50, active: false });
    const currentRef = useRef({ x: 50, y: 50 });
    const rafRef = useRef(null);

    const syncBgHeight = useCallback(() => {
        const pic = picRef.current;
        const holder = holderRef.current;
        if (pic && holder) {
            holder.style.setProperty('--profile-bg-height', `${pic.offsetHeight * 0.65}px`);
        }
    }, []);

    // Lerp loop — runs only while cursor is inside the holder
    const startLerp = useCallback(() => {
        if (rafRef.current) return;
        const tick = () => {
            const bg = bgRef.current;
            const t = targetRef.current;
            const c = currentRef.current;
            if (!bg) return;

            c.x += (t.x - c.x) * 0.04;
            c.y += (t.y - c.y) * 0.04;
            bg.style.setProperty('--grad-x', `${c.x}%`);
            bg.style.setProperty('--grad-y', `${c.y}%`);

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    }, []);

    const stopLerp = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const handleHolderMouseMove = useCallback((e) => {
        const bg = bgRef.current;
        if (!bg) return;
        const rect = bg.getBoundingClientRect();
        targetRef.current.x = ((e.clientX - rect.left) / rect.width)  * 100;
        targetRef.current.y = ((e.clientY - rect.top)  / rect.height) * 100;
        bg.style.setProperty('--grad-opacity', '1');
        startLerp();
    }, [startLerp]);

    const handleHolderMouseLeave = useCallback(() => {
        const bg = bgRef.current;
        if (bg) bg.style.setProperty('--grad-opacity', '0');
        stopLerp();
    }, [stopLerp]);

    useEffect(() => stopLerp, [stopLerp]);

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i <= SUBTITLE.length) {
                setTyped(SUBTITLE.slice(0, i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 50);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        syncBgHeight();
        window.addEventListener('resize', syncBgHeight);
        return () => window.removeEventListener('resize', syncBgHeight);
    }, [syncBgHeight]);

    return (
        <section
            className="profile-holder"
            ref={holderRef}
            onMouseMove={handleHolderMouseMove}
            onMouseLeave={handleHolderMouseLeave}
        >
            <img
                className="profile-pic"
                src={profilePic}
                alt="Portrait of Kolvin Liu"
                onLoad={syncBgHeight}
                ref={picRef}
            />
            <div className="profile-background" ref={bgRef}></div>
            <h1 className="profile-heading" id="first">KOLVIN LIU</h1>
            <h1 className="profile-heading" id="second">KOLVIN LIU</h1>
            <div className="subtitle-group">
                <p className="subtitle">
                    <span className="subtitle-text">{typed}</span>
                    <span className="subtitle-cursor">|</span>
                </p>
            <Link
                className="scroll-down"
                to="/work"
                aria-label="Go to latest work"
            >
                <span className="scroll-down-dot" aria-hidden="true" />
            </Link>
            </div>
        </section>
    );
}

export default Profile;
