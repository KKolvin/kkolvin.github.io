import React, { useState, useEffect, useRef } from 'react';

const FORMSPREE_ENDPOINT = `https://formspree.io/f/${process.env.REACT_APP_FORMSPREE_ID}`;

export default function ContactModal({ isOpen, onClose }) {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | success | error
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setForm({ name: '', email: '', message: '' });
            setStatus('idle');
        }
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="modal-box" role="dialog" aria-modal="true" aria-label="Contact form">
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

                <h2 className="modal-title">Get in touch</h2>
                <p className="modal-subtitle">Send me a message and I'll get back to you.</p>

                {status === 'success' ? (
                    <div className="modal-success">
                        <span className="modal-success-icon">✓</span>
                        <p>Message sent! I'll reply soon.</p>
                    </div>
                ) : (
                    <form className="modal-form" onSubmit={handleSubmit} noValidate>
                        <label className="modal-label">
                            Name
                            <input
                                className="modal-input"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                                autoComplete="name"
                            />
                        </label>

                        <label className="modal-label">
                            Email
                            <input
                                className="modal-input"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                                autoComplete="email"
                            />
                        </label>

                        <label className="modal-label">
                            Message
                            <textarea
                                className="modal-input modal-textarea"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="What's on your mind?"
                                required
                                rows={5}
                            />
                        </label>

                        {status === 'error' && (
                            <p className="modal-error">Something went wrong. Please try again.</p>
                        )}

                        <button
                            className="modal-submit"
                            type="submit"
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? 'Sending...' : 'Send message ->'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
