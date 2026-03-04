import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Profile, NeuralCanvas, ContactModal } from './components';
import WorkPage from './pages/WorkPage';
import './assets/styles/main.css';

// Page order used to determine scroll direction
const PAGE_ORDER = ['/', '/work'];

function AnimatedRoutes() {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [stage, setStage] = useState('idle'); // 'idle' | 'exit' | 'enter'
    const directionRef = useRef('forward');

    const displayPathname = displayLocation.pathname;
    useEffect(() => {
        if (location.pathname === displayPathname) return;

        const from = PAGE_ORDER.indexOf(displayPathname);
        const to   = PAGE_ORDER.indexOf(location.pathname);
        directionRef.current = to > from ? 'forward' : 'back';

        setStage('exit');
    }, [location.pathname, displayPathname]);

    const handleAnimationEnd = () => {
        if (stage === 'exit') {
            setDisplayLocation(location);
            setStage('enter');
        } else if (stage === 'enter') {
            setStage('idle');
        }
    };

    const cls = stage === 'idle'
        ? ''
        : `page-${stage} page-${stage}--${directionRef.current}`;

    return (
        <div className={`page-wrapper ${cls}`} onAnimationEnd={handleAnimationEnd}>
            <Routes location={displayLocation}>
                <Route path="/"     element={<Profile />} />
                <Route path="/work" element={<WorkPage />} />
            </Routes>
        </div>
    );
}

function App() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <HashRouter>
            <NeuralCanvas />
            <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
            <main className="site-shell">
                <header className="top-bar">
                    <nav className="nav-menu">
                        <span className="nav-hamburger" aria-label="Menu">
                            <span /><span /><span />
                        </span>
                        <div className="nav-dropdown">
                            <Link className="nav-dropdown-item" to="/">Home</Link>
                            <Link className="nav-dropdown-item" to="/work">Work</Link>
                        </div>
                    </nav>
                    <button className="top-bar-link" onClick={() => setContactOpen(true)}>Get in touch -&gt;</button>
                </header>

                <AnimatedRoutes />
            </main>
        </HashRouter>
    );
}

export default App;
