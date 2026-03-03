import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const RESUME_PATH = '/resume.pdf';

export default function ResumeModal({ isOpen, onClose }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) {
            document.addEventListener('keydown', onKey);
            window.dispatchEvent(new Event('canvas-pause'));
        }
        return () => {
            document.removeEventListener('keydown', onKey);
            if (isOpen) window.dispatchEvent(new Event('canvas-resume'));
        };
    }, [isOpen, onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay resume-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="modal-box resume-box" role="dialog" aria-modal="true" aria-label="Resume preview">
                <div className="resume-header">
                    <span className="resume-title">Resume</span>
                    <div className="resume-actions">
                        <a
                            className="resume-download"
                            href={RESUME_PATH}
                            download="Kolvin_Liu_Resume.pdf"
                            aria-label="Download resume"
                        >
                            Download ↓
                        </a>
                        <button className="modal-close resume-close" onClick={onClose} aria-label="Close">✕</button>
                    </div>
                </div>
                <div className="resume-preview">
                    <iframe
                        src={RESUME_PATH}
                        title="Resume preview"
                        className="resume-iframe"
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}
