import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ResumeModal } from '../components';

function WorkPage() {
    const [resumeOpen, setResumeOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            const el = document.getElementById(location.state.scrollTo);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.state]);

    return (
        <>
        <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
        <section className="latest-work">
            <div className="work-intro">
                <h2 className="work-intro-heading">
                    Hello, I'm Kolvin.
                </h2>
                <p className="work-intro-body">
                    I studied Statistics and Computer Science at <strong>Boston University</strong> and am now an MSCS student at <strong>Georgia Tech</strong>.<br />
                    My experience focuses on <strong>model quantization and optimization</strong>, <strong>inference acceleration</strong>,
                    and improving the efficiency of <strong>RL post-training pipelines</strong>.<br />
                    Currently, I'm also exploring the potential of <strong>agentic systems</strong>.
                </p>
                <div className="work-intro-tags">
                    <span>Model Optimization</span>
                    <span>AI Infrastructure</span>
                    <span>High-Performance Computing</span>
                    <span>System Engineering</span>
                </div>
                <Link
                    className="scroll-up"
                    to="/"
                    aria-label="Go to home"
                >
                    <span className="scroll-up-dot" aria-hidden="true" />
                </Link>
            </div>

            <div id="work-section" className="work-section">
                <h2>VIEW MY RESUME</h2>
                <div className="work-grid">
                    <button
                        className="work-card resume-card"
                        onClick={() => setResumeOpen(true)}
                    >
                        <span>Resume</span>
                        <small>View &amp; download</small>
                    </button>
                </div>
                <h2 className="work-section-gap">PAST WORK</h2>
                <div className="work-grid">
                    <a
                        className="work-card"
                        href="https://kkolvin.github.io/Static-Web-Birdy/index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>Birdy</span>
                        <small>Static Website Design</small>
                    </a>
                    <div className="work-card muted">
                        <span>Portfolio Refresh</span>
                        <small>Current website redesign</small>
                    </div>
                    <div className="work-card muted">
                        <span>More Projects</span>
                        <small>Coming soon</small>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}

export default WorkPage;
