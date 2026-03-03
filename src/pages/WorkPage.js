import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResumeModal } from '../components';

function WorkPage() {
    const [resumeOpen, setResumeOpen] = useState(false);

    return (
        <>
        <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
        <section className="latest-work">
            <div className="work-intro">
                <h2 className="work-intro-heading">
                    Hello, I'm Kolvin.
                </h2>
                <p className="work-intro-body">
                    I studied Statistics and Computer Science at Boston University and am now an MSCS student at Georgia Tech.<br />
                    My experience focuses on model quantization and optimization, inference acceleration,
                    and improving the efficiency of RL post-training pipelines.<br />
                    Currently, I'm also exploring the potential of agentic systems.
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

            <div className="work-section">
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
