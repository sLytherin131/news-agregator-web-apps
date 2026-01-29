'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import Link from 'next/link';

const SOURCES = ["CNN Indonesia", "Detik", "Kompas", "Tempo", "Sindo", "MetroTV News"];
const LABELS = ["oposisi", "netral", "pro_pemerintah"];

export default function AdminNewsList() {
    const [news, setNews] = useState<any[]>([]);
    const [filteredNews, setFilteredNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filter states
    const [filterSource, setFilterSource] = useState('');
    const [filterLabel, setFilterLabel] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // 'classified' | 'unclassified'

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [news, filterSource, filterLabel, filterStatus]);

    const fetchNews = async () => {
        try {
            const data = await apiRequest('/news/');
            setNews(data);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...news];

        if (filterSource) {
            result = result.filter(item => item.source === filterSource);
        }

        if (filterLabel) {
            result = result.filter(item => item.label === filterLabel);
        }

        if (filterStatus === 'classified') {
            result = result.filter(item => !!item.label);
        } else if (filterStatus === 'unclassified') {
            result = result.filter(item => !item.label);
        }

        setFilteredNews(result);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await apiRequest(`/news/${id}`, { method: 'DELETE' });
            setNews(prev => prev.filter(item => item.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredNews.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredNews.map(n => n.id.toString()));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected articles?`)) return;

        setActionLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const id of selectedIds) {
            try {
                await apiRequest(`/news/${id}`, { method: 'DELETE' });
                successCount++;
            } catch (err) {
                errorCount++;
            }
        }

        setNews(prev => prev.filter(item => !selectedIds.includes(item.id.toString())));
        setSelectedIds([]);
        setActionLoading(false);
        setMessage({
            type: errorCount === 0 ? 'success' : 'error',
            text: `Bulk Delete: ${successCount} success, ${errorCount} failed.`
        });
    };

    const handleBulkClassify = async () => {
        if (selectedIds.length === 0) return;

        const alreadyClassified = filteredNews.filter(n => selectedIds.includes(n.id.toString()) && n.label);
        if (alreadyClassified.length > 0) {
            alert(`Peringatan: Ada ${alreadyClassified.length} berita yang sudah diklasifikasi terpilih. Tombol ini hanya berlaku untuk berita UNCLASSIFIED.`);
            return;
        }

        setActionLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const id of selectedIds) {
            try {
                const result = await apiRequest(`/news/${id}/classify`, { method: 'POST' });
                // Update local state for classified items
                setNews(prev => prev.map(n => n.id.toString() === id ? { ...n, label: result.label } : n));
                successCount++;
            } catch (err) {
                errorCount++;
            }
        }

        setSelectedIds([]);
        setActionLoading(false);
        setMessage({
            type: errorCount === 0 ? 'success' : 'error',
            text: `Bulk Classification: ${successCount} success, ${errorCount} failed.`
        });
    };

    const hasClassifiedSelected = filteredNews.some(n => selectedIds.includes(n.id.toString()) && n.label);

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
            <Link href="/admin" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                ← Back to Dashboard
            </Link>

            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="form-title" style={{ color: 'var(--text)' }}>News Management</h1>
                    <p className="form-subtitle" style={{ color: 'var(--text-muted)' }}>Manage, filter, and classify your articles.</p>
                </div>

                {selectedIds.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.5rem' }}>
                        <button
                            onClick={handleBulkClassify}
                            disabled={actionLoading || hasClassifiedSelected}
                            className="btn btn-primary"
                            style={{
                                padding: '0.5rem 1rem',
                                width: 'auto',
                                fontSize: '0.85rem',
                                opacity: hasClassifiedSelected ? 0.3 : 1,
                                cursor: hasClassifiedSelected ? 'not-allowed' : 'pointer'
                            }}
                            title={hasClassifiedSelected ? "Beberapa berita terpilih sudah diklasifikasi" : "Klasifikasi massal berita terpilih"}
                        >
                            {actionLoading ? '⏳...' : '✨ Bulk Classify'}
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={actionLoading}
                            className="btn"
                            style={{
                                padding: '0.5rem 1rem',
                                width: 'auto',
                                fontSize: '0.85rem',
                                backgroundColor: 'rgba(231, 111, 81, 0.2)',
                                color: 'var(--error)',
                                border: '1px solid var(--error)',
                                borderRadius: '0.5rem'
                            }}
                        >
                            {actionLoading ? '⏳...' : '🗑️ Bulk Delete'}
                        </button>
                    </div>
                )}
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

            {/* Filter Bar */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label htmlFor="filter-source" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Source</label>
                    <select id="filter-source" value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.4rem', color: 'var(--text)' }}>
                        <option value="">All Sources</option>
                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label htmlFor="filter-label" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Label</label>
                    <select id="filter-label" value={filterLabel} onChange={e => setFilterLabel(e.target.value)} style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.4rem', color: 'var(--text)' }}>
                        <option value="">All Labels</option>
                        {LABELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label htmlFor="filter-status" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Status</label>
                    <select id="filter-status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.4rem', color: 'var(--text)' }}>
                        <option value="">All Status</option>
                        <option value="classified">Classified</option>
                        <option value="unclassified">Unclassified</option>
                    </select>
                </div>
                <button
                    onClick={() => { setFilterSource(''); setFilterLabel(''); setFilterStatus(''); setSelectedIds([]); }}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.5rem', width: 'auto', fontSize: '0.9rem' }}
                >
                    Reset
                </button>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <input
                    type="checkbox"
                    id="select-all"
                    checked={filteredNews.length > 0 && selectedIds.length === filteredNews.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="select-all" style={{ cursor: 'pointer' }}>Select All ({filteredNews.length} articles)</label>
            </div>

            {loading ? (
                <p style={{ color: 'var(--text)' }}>Loading news...</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredNews.map(item => {
                        let badgeBg = 'var(--glass)';
                        if (item.label === 'netral') badgeBg = 'var(--success)';
                        else if (item.label) badgeBg = 'var(--primary)';

                        return (
                            <Link
                                key={item.id}
                                href={`/admin/news/${item.id}`}
                                className="glass"
                                style={{
                                    padding: '1.25rem',
                                    display: 'grid',
                                    gridTemplateColumns: '40px 80px 1fr auto',
                                    gap: '1.5rem',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s ease',
                                    color: 'var(--text)'
                                }}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id.toString())}
                                        onChange={() => toggleSelect(item.id.toString())}
                                        style={{ cursor: 'pointer', width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)', position: 'relative', zIndex: 10 }}
                                    />
                                </div>
                                <img
                                    src={item.img_url || 'https://via.placeholder.com/80'}
                                    alt={item.title}
                                    style={{ width: '80px', height: '60px', borderRadius: '0.4rem', objectFit: 'cover' }}
                                />
                                <div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span>{item.source}</span>
                                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        backgroundColor: badgeBg,
                                        color: item.label ? 'var(--text)' : 'var(--text-muted)'
                                    }}>
                                        {item.label?.toUpperCase() || 'UNCLASSIFIED'}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1rem' }}
                                        title="Delete article"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </Link>
                        );
                    })}
                    {filteredNews.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No news found matching those filters.</p>}
                </div>
            )}
        </div>
    );
}
