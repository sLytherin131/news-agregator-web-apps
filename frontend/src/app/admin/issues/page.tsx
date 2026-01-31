'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import Link from 'next/link';

export default function AdminIssuesList() {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const data = await apiRequest('/issues/');
            setIssues(data);
        } catch (err: any) {
            console.error(err.message);
            setMessage({ type: 'error', text: `Failed to fetch issues: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();

        setActionLoading(id);
        setMessage({ type: '', text: '' });

        try {
            await apiRequest(`/issues/${id}/summarize`, { method: 'POST' });
            setMessage({ type: 'success', text: `Issue #${id} summarized successfully!` });
            fetchIssues(); // Refresh list to see updated summaries
        } catch (err: any) {
            setMessage({ type: 'error', text: `Summarization failed: ${err.message}` });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this issue? This will unlink all associated news.')) return;

        try {
            await apiRequest(`/issues/${id}`, { method: 'DELETE' });
            setIssues(prev => prev.filter(item => item.id !== id));
            setMessage({ type: 'success', text: `Issue #${id} deleted.` });
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
            <Link href="/admin" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                ← Back to Dashboard
            </Link>

            <header style={{ marginBottom: '2rem' }}>
                <h1 className="form-title" style={{ color: 'var(--text)' }}>Issues Management</h1>
                <p className="form-subtitle" style={{ color: 'var(--text-muted)' }}>View and manage grouped news issues and AI-generated summaries.</p>
            </header>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? 'rgba(42, 157, 143, 0.1)' : 'rgba(231, 111, 81, 0.1)',
                    color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                    border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {loading ? (
                <p style={{ color: 'var(--text)' }}>Loading issues...</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {issues.map(item => (
                        <Link
                            key={item.id}
                            href={`/admin/issues/${item.id}`}
                            className="glass"
                            style={{
                                padding: '1.5rem',
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr auto auto',
                                gap: '1.5rem',
                                alignItems: 'center',
                                transition: 'transform 0.2s ease',
                                color: 'var(--text)'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '60px',
                                borderRadius: '0.5rem',
                                overflow: 'hidden',
                                background: 'var(--glass)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.representative_image ? (
                                    <img
                                        src={item.representative_image}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span>{item.news_count || 0} news articles</span>
                                    <span>Updated: {new Date(item.timemodified || item.created_at).toLocaleString()}</span>
                                    {item.summarize_all && (
                                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>✨ Summarized</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={(e) => handleSummarize(e, item.id)}
                                    disabled={actionLoading === item.id}
                                    className="btn"
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        width: 'auto',
                                        fontSize: '0.85rem',
                                        backgroundColor: item.summarize_all ? 'transparent' : 'var(--primary)',
                                        color: item.summarize_all ? 'var(--primary)' : '#fff',
                                        border: `2px solid var(--primary)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        borderRadius: '0.75rem'
                                    }}
                                >
                                    {actionLoading === item.id ? '⏳...' : item.summarize_all ? 'Re-Summarize' : 'Summarize'}
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, item.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.2rem' }}
                                    title="Delete issue"
                                >
                                    🗑️
                                </button>
                            </div>
                            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                                →
                            </div>
                        </Link>
                    ))}
                    {issues.length === 0 && (
                        <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No issues found yet. Group some news first!</p>
                            <Link href="/admin/news" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', width: 'auto' }}>
                                Go to News Management
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
