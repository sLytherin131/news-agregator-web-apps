'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../../lib/api';
import Link from 'next/link';

const SOURCES = ["CNN Indonesia", "Detik", "Kompas", "Tempo", "Sindo", "MetroTV News"];
const LABELS = ["oposisi", "netral", "pro_pemerintah"];

export default function NewsDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        source: '',
        link_article: '',
        img_url: '',
        label: '',
        published_at: ''
    });

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const data = await apiRequest(`/news/${id}`);
            setFormData({
                title: data.title,
                content: data.content,
                source: data.source,
                link_article: data.link_article,
                img_url: data.img_url,
                label: data.label || '',
                published_at: data.published_at ? new Date(data.published_at).toISOString().slice(0, 16) : ''
            });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await apiRequest(`/news/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            setMessage({ type: 'success', text: 'Article updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setActionLoading(false);
        }
    };

    const handleClassify = async () => {
        setActionLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await apiRequest(`/news/${id}/classify`, { method: 'POST' });
            setFormData(prev => ({ ...prev, label: result.label }));
            setMessage({ type: 'success', text: `Classification successful! Labeled as: ${result.label.toUpperCase()}` });
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Classification failed: ' + err.message });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading article details...</div>;

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
            <Link href="/admin/news" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                ← Back to List
            </Link>

            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 className="form-title">Edit News</h1>
                <p className="form-subtitle">Modify article data or trigger AI classification.</p>

                {/* Classification Button */}
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    {!formData.label ? (
                        <button
                            onClick={handleClassify}
                            disabled={actionLoading}
                            className="btn btn-primary"
                            style={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.85rem',
                                width: 'auto',
                                fontWeight: 700,
                                border: 'none'
                            }}
                        >
                            {actionLoading ? 'Classifying...' : '✨ Trigger Classification'}
                        </button>
                    ) : (
                        <div className="glass" style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--primary)', display: 'inline-block' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Label</span>
                            <strong style={{ color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.9rem' }}>{formData.label}</strong>
                        </div>
                    )}
                </div>
            </header>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '2rem',
                    backgroundColor: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                    color: 'var(--text)',
                    fontWeight: 600
                }}>
                    {message.text}
                </div>
            )}

            <div className="glass" style={{ padding: '2.5rem' }}>
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div>
                            <div className="input-group">
                                <label htmlFor="edit-title">Title</label>
                                <input
                                    id="edit-title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="edit-url">Original URL</label>
                                <input
                                    id="edit-url"
                                    type="url"
                                    value={formData.link_article}
                                    onChange={(e) => setFormData({ ...formData, link_article: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="edit-img">Image URL</label>
                                <input
                                    id="edit-img"
                                    type="url"
                                    value={formData.img_url}
                                    onChange={(e) => setFormData({ ...formData, img_url: e.target.value })}
                                />
                                {formData.img_url && (
                                    <img src={formData.img_url} alt="Preview" style={{ marginTop: '1rem', width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="input-group">
                                <label htmlFor="edit-source">Source</label>
                                <select
                                    id="edit-source"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)' }}
                                >
                                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="edit-label">Label (Manual Override)</label>
                                <select
                                    id="edit-label"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)' }}
                                >
                                    <option value="">Unclassified</option>
                                    {LABELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="edit-published">Published At</label>
                                <input
                                    id="edit-published"
                                    type="datetime-local"
                                    required
                                    value={formData.published_at}
                                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="edit-content">Content</label>
                        <textarea
                            id="edit-content"
                            required
                            rows={15}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text)',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button className="btn btn-primary" type="submit" disabled={actionLoading} style={{ flex: 1, border: 'none' }}>
                            {actionLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/news')}
                            className="btn"
                            style={{ flex: 1, backgroundColor: 'var(--glass)', color: 'var(--text)', border: 'none', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
