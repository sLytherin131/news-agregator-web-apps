'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../../lib/api';
import Link from 'next/link';

export default function AdminIssueDetail() {
    const params = useParams();
    const router = useRouter();
    const [issue, setIssue] = useState<any>(null);
    const [relatedNews, setRelatedNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [summarizing, setSummarizing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const issueData = await apiRequest(`/issues/${params.id}`);
            const newsData = await apiRequest(`/issues/${params.id}/news`);
            setIssue(issueData);
            setRelatedNews(newsData);
            setEditedTitle(issueData.title);
        } catch (err: any) {
            setMessage({ type: 'error', text: `Error: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        setSummarizing(true);
        setMessage({ type: '', text: '' });
        try {
            await apiRequest(`/issues/${params.id}/summarize`, { method: 'POST' });
            setMessage({ type: 'success', text: 'Issue summarized successfully!' });
            fetchData(); // Refresh summary data
        } catch (err: any) {
            setMessage({ type: 'error', text: `Summarization failed: ${err.message}` });
        } finally {
            setSummarizing(false);
        }
    };

    const handleSaveTitle = async () => {
        try {
            await apiRequest(`/issues/${params.id}`, {
                method: 'PUT',
                body: JSON.stringify({ title: editedTitle })
            });
            setIssue({ ...issue, title: editedTitle });
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Title updated.' });
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading issue details...</div>;
    if (!issue) return <div className="container" style={{ padding: '4rem' }}>Issue not found.</div>;

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
            <Link href="/admin/issues" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                ← Back to Issues
            </Link>

            <header style={{ marginBottom: '3.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
                                <input
                                    value={editedTitle}
                                    onChange={e => setEditedTitle(e.target.value)}
                                    style={{
                                        fontSize: '2rem',
                                        fontWeight: 800,
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--card-bg)',
                                        border: '2px solid var(--primary)',
                                        color: 'var(--text)',
                                        borderRadius: '0.75rem',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={handleSaveTitle} className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>✨ Save Changes</button>
                                    <button onClick={() => setIsEditing(false)} className="btn" style={{ width: 'auto', padding: '0.6rem 1.5rem', background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h1 className="form-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', lineHeight: '1.2' }}>
                                    {issue.title}
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            background: 'var(--glass)',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            padding: '0.4rem',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Edit title"
                                    >
                                        ✏️
                                    </button>
                                </h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Created at {new Date(issue.created_at).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSummarize}
                        disabled={summarizing}
                        className="btn"
                        style={{
                            width: 'auto',
                            padding: '0.75rem 1.75rem',
                            backgroundColor: 'var(--primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontSize: '0.95rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 12px rgba(231, 111, 81, 0.2)'
                        }}
                    >
                        {summarizing ? '⏳ Summarizing...' : 'Refresh AI Summary'}
                    </button>
                </div>
            </header>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '2rem',
                    backgroundColor: message.type === 'success' ? 'rgba(42, 157, 143, 0.1)' : 'rgba(231, 111, 81, 0.1)',
                    color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                    border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
                {/* Left Side: AI Summaries */}
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <section className="glass" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>✨ AI Bias Comparison</h2>
                        {issue.summarize_all ? (
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: 'var(--text)' }}>
                                {issue.summarize_all}
                            </div>
                        ) : (
                            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No summary generated yet. Click "Refresh AI Summary" to generate.</p>
                        )}
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', borderTop: '4px solid #e76f51' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#e76f51' }}>Oposisi</h3>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {issue.summarize_oposisi || "Belum ada ringkasan."}
                            </div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderTop: '4px solid #2a9d8f' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#2a9d8f' }}>Netral</h3>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {issue.summarize_netral || "Belum ada ringkasan."}
                            </div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderTop: '4px solid #264653' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#264653' }}>Pro-Pemerintah</h3>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {issue.summarize_pro_pemerintah || "Belum ada ringkasan."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Related News */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Related News ({relatedNews.length})</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {relatedNews.map(n => (
                            <Link
                                key={n.id}
                                href={`/admin/news/${n.id}`}
                                className="glass"
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    gap: '1rem',
                                    transition: 'transform 0.2s ease',
                                    color: 'var(--text)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <img
                                    src={n.img_url || 'https://via.placeholder.com/60'}
                                    style={{ width: '60px', height: '45px', borderRadius: '0.3rem', objectFit: 'cover' }}
                                />
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{n.title}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{n.source}</span>
                                        <span style={{
                                            padding: '0 0.4rem',
                                            borderRadius: '1rem',
                                            background: n.label === 'netral' ? '#2a9d8f' : (n.label ? 'var(--primary)' : 'var(--glass)'),
                                            color: '#fff',
                                            fontSize: '0.65rem',
                                            fontWeight: 800
                                        }}>
                                            {n.label?.toUpperCase() || 'NONE'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
