'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

export default function BookmarksPage() {
    const [bookmarkedIssues, setBookmarkedIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            router.push('/login');
            return;
        }

        async function fetchBookmarks() {
            try {
                const data = await apiRequest('/bookmarks/');
                setBookmarkedIssues(data);
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchBookmarks();
    }, [router]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return 'Unknown';

        let date: Date;
        try {
            // Only append 'Z' if it looks like a local ISO string without TZ info
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

    const renderDistributionBar = (counts: any, total: number) => {
        if (!counts || total === 0) return null;
        const oppPercent = (counts.opposition / total) * 100;
        const neuPercent = (counts.neutral / total) * 100;
        const proPercent = (counts.pro_government / total) * 100;

        let dominantLabel = "";
        let dominantPercent = 0;
        if (counts.opposition >= counts.neutral && counts.opposition >= counts.pro_government) {
            dominantLabel = "leaning Opposition";
            dominantPercent = Math.round(oppPercent);
        } else if (counts.neutral >= counts.opposition && counts.neutral >= counts.pro_government) {
            dominantLabel = "Neutral";
            dominantPercent = Math.round(neuPercent);
        } else {
            dominantLabel = "leaning Pro Government";
            dominantPercent = Math.round(proPercent);
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={{
                    display: 'flex',
                    height: '6px',
                    width: '70px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.1)'
                }}>
                    <div style={{ width: `${oppPercent}%`, background: '#e91e63' }} title="Opposition" />
                    <div style={{ width: `${neuPercent}%`, background: '#FFFFFF' }} title="Neutral" />
                    <div style={{ width: `${proPercent}%`, background: '#2a9d8f' }} title="Pro Government" />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{total} sources</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                    • {dominantPercent}% {dominantLabel}
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading your bookmarks...</p>
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
                    Your <span style={{ color: 'var(--primary)' }}>Bookmarks</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Issues you've saved for later reading
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

            {bookmarkedIssues.length === 0 ? (
                <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <img
                        src="https://img.icons8.com/?size=100&id=ttPVWWAN2Fak&format=png&color=000000"
                        alt="No bookmarks"
                        style={{
                            width: '80px',
                            height: '80px',
                            marginBottom: '1.5rem',
                            filter: 'var(--icon-filter, invert(1))',
                            opacity: 0.6
                        }}
                    />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>No bookmarks yet</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Start bookmarking issues you want to read later
                    </p>
                    <Link href="/" className="btn btn-primary">
                        Explore Issues
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                    {bookmarkedIssues.map((issue) => (
                        <Link key={issue.id} href={`/issues/${issue.id}`} style={{ textDecoration: 'none' }}>
                            <article className="glass card-hover responsive-bookmark-card">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <img
                                                src="https://img.icons8.com/?size=100&id=ttPVWWAN2Fak&format=png&color=000000"
                                                alt="Bookmarked"
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    filter: 'var(--icon-filter, invert(1))',
                                                    opacity: 0.8
                                                }}
                                            />
                                            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bookmarked</span>
                                        </div>
                                        <span>•</span>
                                        <span>{issue.view_count} views</span>
                                        <span>•</span>
                                        <span>{formatRelativeTime(issue.created_at)}</span>
                                        {issue.timemodified && (
                                            <>
                                                <span>•</span>
                                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                    Updated {formatRelativeTime(issue.timemodified)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.35rem',
                                        fontWeight: 800,
                                        lineHeight: '1.3',
                                        marginBottom: '1rem',
                                        color: 'var(--text)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {issue.title}
                                    </h3>

                                    {/* Distribution Bar */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {renderDistributionBar(issue.label_counts, issue.news_count)}
                                    </div>
                                </div>

                                {issue.representative_image && (
                                    <div className="bookmark-image-container">
                                        <img
                                            src={issue.representative_image}
                                            alt={issue.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </article>
                        </Link>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '3rem' }}>
                <Footer />
            </div>
        </div>
    );
}
