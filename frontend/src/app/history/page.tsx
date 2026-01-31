'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

export default function HistoryPage() {
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            router.push('/login');
            return;
        }

        async function fetchHistory() {
            try {
                const data = await apiRequest('/reading-history/');
                setHistoryItems(data);
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [router]);

    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return 'Unknown';

        let date: Date;
        try {
            const ds = (dateString.includes('T') || dateString.includes(' ')) &&
                !dateString.endsWith('Z') &&
                !dateString.includes('+') &&
                !/-\d{2}:\d{2}$/.test(dateString)
                ? `${dateString.replace(' ', 'T')}Z`
                : dateString;

            date = new Date(ds);
            if (isNaN(date.getTime())) throw new Error('Invalid');
        } catch (e) {
            return 'Invalid date';
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';

        const minutes = Math.floor(diffInSeconds / 60);
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;

        const hours = Math.floor(diffInSeconds / 3600);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

        const days = Math.floor(diffInSeconds / 86400);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleArticleClick = async (newsId: number, articleUrl: string, e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await apiRequest(`/reading-history/${newsId}`, { method: 'POST' });
        } catch (err) {
            console.error('Failed to track reading:', err);
        }
        window.open(articleUrl, '_blank');

        // Refresh history to show updated time
        const data = await apiRequest('/reading-history/');
        setHistoryItems(data);
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading your reading history...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '0.5rem' }}>
            <header style={{
                marginBottom: '3rem',
                textAlign: 'center',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                    Reading <span style={{ color: 'var(--primary)' }}>History</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Articles you've explored on the platform
                </p>
            </header>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 61, 113, 0.1)',
                    border: '1px solid #FF3D71',
                    borderRadius: '0.5rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    color: '#FF3D71'
                }}>
                    {error}
                </div>
            )}

            {historyItems.length === 0 ? (
                <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <img
                        src="https://img.icons8.com/?size=100&id=6904&format=png&color=000000"
                        alt="No history"
                        style={{
                            width: '80px',
                            height: '80px',
                            marginBottom: '1.5rem',
                            filter: 'var(--icon-filter, invert(1))',
                            opacity: 0.6
                        }}
                    />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Your history is empty</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Start reading articles to see them listed here
                    </p>
                    <Link href="/" className="btn btn-primary">
                        Find Articles
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {historyItems.map((item, idx) => {
                        const news = item.news;
                        if (!news) return null;

                        return (
                            <a
                                key={`${item.news_id}-${idx}`}
                                href={news.link_article}
                                onClick={(e) => handleArticleClick(news.id, news.link_article, e)}
                                rel="noopener noreferrer"
                                className="glass"
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    transition: 'transform 0.2s ease',
                                    color: 'var(--text)',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ width: '120px', height: '90px', flexShrink: 0, borderRadius: '0.5rem', overflow: 'hidden' }}>
                                    <img
                                        src={news.img_url || 'https://via.placeholder.com/120x90'}
                                        alt={news.source}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>{news.source}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Read {formatRelativeTime(item.read_at)}</span>
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        lineHeight: '1.3',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {news.title}
                                    </h3>
                                    {news.label && (
                                        <span style={{
                                            alignSelf: 'flex-start',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '0.4rem',
                                            background: news.label === 'oposisi' ? 'rgba(255, 61, 113, 0.1)' :
                                                news.label === 'pro_pemerintah' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--border)',
                                            color: news.label === 'oposisi' ? '#FF3D71' :
                                                news.label === 'pro_pemerintah' ? '#2ECC71' : 'var(--text-muted)',
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase'
                                        }}>
                                            {news.label === 'oposisi' ? 'Lean Opposition' :
                                                news.label === 'pro_pemerintah' ? 'Lean Pro Government' : 'Neutral'}
                                        </span>
                                    )}
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}

            <div style={{ marginTop: '3rem' }}>
                <Footer />
            </div>
        </div>
    );
}
