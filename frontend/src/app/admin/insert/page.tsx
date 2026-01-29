'use client';

import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import Link from 'next/link';

const SOURCES = ["CNN Indonesia", "Detik", "Kompas", "Tempo", "Sindo", "MetroTV News"];

export default function InsertNews() {
    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [manualData, setManualData] = useState({
        link_article: '',
        title: '',
        content: '',
        source: SOURCES[0],
        published_at: new Date().toISOString().slice(0, 16)
    });
    const [autoData, setAutoData] = useState({
        link_article: '',
        source: SOURCES[0]
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!imageFile) {
            setMessage({ type: 'error', text: 'Please upload an image for manual insertion.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        Object.entries(manualData).forEach(([key, value]) => formData.append(key, value));
        formData.append('image', imageFile);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/news/manual`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to insert');
            }

            setMessage({ type: 'success', text: 'News article inserted manually!' });
            setManualData({
                link_article: '',
                title: '',
                content: '',
                source: SOURCES[0],
                published_at: new Date().toISOString().slice(0, 16)
            });
            setImageFile(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await apiRequest('/news/auto', {
                method: 'POST',
                body: JSON.stringify(autoData)
            });
            setMessage({ type: 'success', text: 'News article scraped and saved automatically!' });
            setAutoData({ link_article: '', source: SOURCES[0] });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
            <Link href="/admin" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                ← Back to Dashboard
            </Link>

            <header style={{ marginBottom: '3rem' }}>
                <h1 className="form-title">Add News Article</h1>
                <p className="form-subtitle">Choose between manual entry or automated scraping.</p>
            </header>

            {/* Mode Switcher */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2.5rem',
                backgroundColor: 'var(--glass)',
                padding: '0.5rem',
                borderRadius: '0.75rem',
                maxWidth: '600px',
                margin: '0 auto 2.5rem auto'
            }}>
                <button
                    onClick={() => setMode('manual')}
                    className="btn"
                    style={{
                        flex: 1,
                        backgroundColor: mode === 'manual' ? 'var(--primary)' : 'transparent',
                        color: mode === 'manual' ? 'white' : 'var(--text)',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontWeight: 600,
                        padding: '0.8rem'
                    }}
                >
                    Manual Entry
                </button>
                <button
                    onClick={() => setMode('auto')}
                    className="btn"
                    style={{
                        flex: 1,
                        backgroundColor: mode === 'auto' ? 'var(--primary)' : 'transparent',
                        color: mode === 'auto' ? 'white' : 'var(--text)',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontWeight: 600,
                        padding: '0.8rem'
                    }}
                >
                    Automated Scraping
                </button>
            </div>

            <div className="glass" style={{ padding: '2.5rem', maxWidth: '900px', margin: '0 auto', border: '1px solid var(--border)' }}>
                {message.text && (
                    <div style={{
                        padding: '1.25rem',
                        borderRadius: '0.5rem',
                        marginBottom: '2rem',
                        backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                        fontWeight: 600,
                        textAlign: 'center'
                    }}>
                        {message.type === 'success' ? '✅' : '❌'} {message.text}
                    </div>
                )}

                {mode === 'manual' ? (
                    <form onSubmit={handleManualSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label htmlFor="manual-title" style={{ color: 'var(--text)', fontWeight: 600 }}>Article Title</label>
                                <input
                                    id="manual-title"
                                    type="text"
                                    required
                                    placeholder="Enter news title..."
                                    value={manualData.title}
                                    onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="manual-published" style={{ color: 'var(--text)', fontWeight: 600 }}>Published At</label>
                                <input
                                    id="manual-published"
                                    type="datetime-local"
                                    required
                                    value={manualData.published_at}
                                    onChange={(e) => setManualData({ ...manualData, published_at: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="manual-link" style={{ color: 'var(--text)', fontWeight: 600 }}>Article Link</label>
                                <input
                                    id="manual-link"
                                    type="url"
                                    required
                                    placeholder="https://..."
                                    value={manualData.link_article}
                                    onChange={(e) => setManualData({ ...manualData, link_article: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="manual-image" style={{ color: 'var(--text)', fontWeight: 600 }}>Featured Image</label>
                                <input
                                    id="manual-image"
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                    style={{ padding: '0.5rem 0', color: 'var(--text)' }}
                                />
                                {imageFile && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '0.5rem' }}>✅ {imageFile.name}</p>
                                        <div style={{ position: 'relative', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                            <img
                                                src={URL.createObjectURL(imageFile)}
                                                alt="Preview"
                                                style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Source</label>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem 2rem',
                                padding: '1.25rem',
                                background: 'var(--card-bg)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)'
                            }}>
                                {SOURCES.map(src => (
                                    <label key={src} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        color: 'var(--text)',
                                        minWidth: '140px'
                                    }}>
                                        <input
                                            type="radio"
                                            name="source"
                                            value={src}
                                            checked={manualData.source === src}
                                            onChange={(e) => setManualData({ ...manualData, source: e.target.value })}
                                            style={{ accentColor: 'var(--primary)', width: '1.1rem', height: '1.1rem' }}
                                        />
                                        {src}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label htmlFor="manual-content" style={{ color: 'var(--text)', fontWeight: 600 }}>Content</label>
                            <textarea
                                id="manual-content"
                                required
                                rows={10}
                                placeholder="Paste or write article content here..."
                                value={manualData.content}
                                onChange={(e) => setManualData({ ...manualData, content: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: 'var(--card-bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text)',
                                    resize: 'vertical',
                                    fontSize: '1rem',
                                    lineHeight: '1.6'
                                }}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '2.5rem',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 700
                            }}
                        >
                            {loading ? 'Submitting...' : 'Save Manual Article'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAutoSubmit}>
                        <div className="input-group">
                            <label htmlFor="auto-link" style={{ color: 'var(--text)', fontWeight: 600 }}>Article Link</label>
                            <input
                                id="auto-link"
                                type="url"
                                required
                                placeholder="https://news.detik.com/..."
                                value={autoData.link_article}
                                onChange={(e) => setAutoData({ ...autoData, link_article: e.target.value })}
                                style={{ fontSize: '1.1rem', padding: '1rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Source</label>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem 2rem',
                                padding: '1.25rem',
                                background: 'var(--card-bg)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)'
                            }}>
                                {SOURCES.map(src => (
                                    <label key={src} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        color: 'var(--text)',
                                        minWidth: '140px'
                                    }}>
                                        <input
                                            type="radio"
                                            name="autoSource"
                                            value={src}
                                            checked={autoData.source === src}
                                            onChange={(e) => setAutoData({ ...autoData, source: e.target.value })}
                                            style={{ accentColor: 'var(--primary)', width: '1.1rem', height: '1.1rem' }}
                                        />
                                        {src}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'rgba(231, 111, 81, 0.1)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginTop: '2rem',
                            borderLeft: '4px solid var(--primary)',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem'
                        }}>
                            💡 <strong>Tip:</strong> System will automatically scrape Title, Featured Image, Content, and Publication Date directly from the provided source link.
                        </div>

                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '2.5rem',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 700
                            }}
                        >
                            {loading ? 'Scraping & Saving...' : 'Save Auto-Scraped Article'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
