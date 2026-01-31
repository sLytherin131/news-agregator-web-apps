'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '../../lib/api';
import Link from 'next/link';
import Footer from '../../components/Footer';

export default function PublicIssueDetail() {
    const params = useParams();
    const [issue, setIssue] = useState<any>(null);
    const [relatedNews, setRelatedNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'opposition' | 'neutral' | 'government'>('all');
    const [newsFilter, setNewsFilter] = useState<'all' | 'oposisi' | 'netral' | 'pro_pemerintah'>('all');

    useEffect(() => {
        window.scrollTo(0, 0);
        if (params.id) {
            fetchData();
        }

        // Initial detection
        const checkTheme = () => {
            const currentTheme = document.documentElement.dataset.theme as 'light' | 'dark' || 'dark';
            setTheme(currentTheme);
        };

        checkTheme();

        // Observer for theme changes
        const observer = new MutationObserver(() => {
            checkTheme();
        });

        observer.observe(document.documentElement, { attributes: true });

        // Initial detection
        const initialTheme = document.documentElement.dataset.theme as 'light' | 'dark' || 'dark';
        setTheme(initialTheme);

        return () => observer.disconnect();
    }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Check if user is admin to skip increment
            const savedUser = localStorage.getItem('user');
            const isAdmin = savedUser && JSON.parse(savedUser).role === 'admin';

            // Fetch issue and increment view if not admin
            const issueData = await apiRequest(`/issues/${params.id}?increment_view=${!isAdmin}`);
            const newsData = await apiRequest(`/issues/${params.id}/news`);

            setIssue(issueData);
            setRelatedNews(newsData);

            // Fetch bookmark status if user logged in
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                try {
                    const bookmarkRes = await apiRequest(`/bookmarks/check/${params.id}`);
                    setIsBookmarked(bookmarkRes.is_bookmarked);
                } catch (bErr) {
                    console.error("Failed to fetch bookmark status:", bErr);
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: relatedNews.length,
        opposition: relatedNews.filter(n => n.label === 'oposisi').length,
        neutral: relatedNews.filter(n => n.label === 'netral').length,
        proGovernment: relatedNews.filter(n => n.label === 'pro_pemerintah').length
    };

    const getDominance = () => {
        if (stats.total === 0) return null;
        const counts = [
            { label: 'leaning Opposition', count: stats.opposition },
            { label: 'Neutral', count: stats.neutral },
            { label: 'leaning Pro Government', count: stats.proGovernment }
        ];
        const dominant = counts.reduce((prev, current) => (prev.count > current.count) ? prev : current);
        const percent = Math.round((dominant.count / stats.total) * 100);
        return { label: dominant.label, percent };
    };

    const dominance = getDominance();

    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return '';
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now.getTime() - past.getTime();
        const diffInSecs = Math.floor(diffInMs / 1000);
        const diffInMins = Math.floor(diffInSecs / 60);
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInMins > 0) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    // Bias Spectrum Logic
    const getMediaBiasData = () => {
        const mediaConfig: { [key: string]: { name: string, logo: string } } = {
            'cnn': { name: 'CNN Indonesia', logo: '/cnn.png' },
            'detik': { name: 'Detikcom', logo: '/detik.png' },
            'kompas': { name: 'Kompas.com', logo: '/kompas.png' },
            'metrotv': { name: 'MetroTV', logo: '/metrotv.png' },
            'sindo': { name: 'Sindonews', logo: '/sindo.png' },
            'tempo': { name: 'Tempo.co', logo: '/tempo.png' }
        };

        const mediaBiasMap: { [key: string]: { scores: number[], count: number } } = {};

        relatedNews.forEach(news => {
            const source = news.source?.toLowerCase();
            let matchedKey = '';

            // Match source string to our logo keys
            if (source.includes('cnn')) matchedKey = 'cnn';
            else if (source.includes('detik')) matchedKey = 'detik';
            else if (source.includes('kompas')) matchedKey = 'kompas';
            else if (source.includes('metro')) matchedKey = 'metrotv';
            else if (source.includes('sindo')) matchedKey = 'sindo';
            else if (source.includes('tempo')) matchedKey = 'tempo';

            if (matchedKey) {
                if (!mediaBiasMap[matchedKey]) {
                    mediaBiasMap[matchedKey] = { scores: [], count: 0 };
                }

                // Map labels to scores: oposisi = -1, netral = 0, pro_pemerintah = 1
                const score = news.label === 'oposisi' ? -1 :
                    news.label === 'pro_pemerintah' ? 1 : 0;

                mediaBiasMap[matchedKey].scores.push(score);
                mediaBiasMap[matchedKey].count++;
            }
        });

        // Calculate average and map to 7 bars
        const spectrum: any[][] = Array.from({ length: 7 }, () => []);

        Object.entries(mediaBiasMap).forEach(([key, data]) => {
            const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.count;

            // Map avgScore (-1 to 1) to index (0 to 6)
            // (-1.0 to -0.72) -> 0
            // (-0.72 to -0.43) -> 1
            // (-0.43 to -0.14) -> 2
            // (-0.14 to 0.14)  -> 3
            // (0.14 to 0.43)   -> 4
            // (0.43 to 0.72)   -> 5
            // (0.72 to 1.0)    -> 6

            let index = 3; // Default neutral (middle)
            if (avgScore <= -0.72) index = 0;
            else if (avgScore <= -0.43) index = 1;
            else if (avgScore <= -0.14) index = 2;
            else if (avgScore < 0.14) index = 3;
            else if (avgScore < 0.43) index = 4;
            else if (avgScore < 0.72) index = 5;
            else index = 6;

            spectrum[index].push({ ...mediaConfig[key], score: avgScore });
        });

        return spectrum;
    };

    const mediaSpectrum = getMediaBiasData();

    const handleCopy = () => {
        const url = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy using navigator:', err);
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
    };

    const fallbackCopy = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    };

    const handleBookmark = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        try {
            const res = await apiRequest(`/bookmarks/toggle/${params.id}`, { method: 'POST' });
            setIsBookmarked(res.is_bookmarked);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleArticleClick = async (newsId: number, articleUrl: string, e: React.MouseEvent) => {
        e.preventDefault();

        // Track reading history if user is logged in
        if (user) {
            try {
                await apiRequest(`/reading-history/${newsId}`, { method: 'POST' });
            } catch (err) {
                console.error('Failed to track reading:', err);
            }
        }

        // Open article in new tab
        window.open(articleUrl, '_blank');
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center', flex: 1 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Menganalisis sudut pandang...</p>
            </div>
            <Footer />
        </div>
    );

    if (error || !issue) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center', flex: 1 }}>
                <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Isu Tidak Ditemukan</h2>
            </div>
            <Footer />
        </div>
    );

    return (
        <div style={{ paddingBottom: '1rem' }}>
            {/* Header Hero */}
            <div style={{
                background: 'var(--bg)',
                padding: '4rem 0 0rem'
            }}>
                <div className="container">

                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        marginBottom: '1rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(to right, var(--text), var(--text-muted))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        maxWidth: '900px'
                    }}>
                        {issue.title}
                    </h1>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', alignItems: 'center' }}>
                            <span>Published at {new Date(issue.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{issue.view_count || 0} views</span>
                            <span>•</span>
                            <span>{relatedNews.length} related news</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                            {copied && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-2.5rem',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--text)',
                                    color: 'var(--bg)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    animation: 'fadeInUp 0.2s ease-out',
                                    zIndex: 10
                                }}>
                                    Copied!
                                </div>
                            )}
                            <button
                                onClick={handleCopy}
                                className="glass"
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    height: '34px',
                                    borderColor: copied ? 'var(--text)' : 'var(--border)',
                                    color: 'var(--text)'
                                }}
                                title={copied ? 'Link Copied!' : 'Copy Link'}
                            >
                                <img
                                    src="https://img.icons8.com/?size=100&id=seqvQKcp0fkb&format=png&color=000000"
                                    alt="Share"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        filter: theme === 'dark' ? 'invert(1) brightness(10)' : 'none'
                                    }}
                                />
                            </button>
                            <button
                                onClick={handleBookmark}
                                className="glass"
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    height: '34px',
                                    borderColor: isBookmarked ? 'var(--primary)' : 'var(--border)',
                                    background: isBookmarked ? 'rgba(231, 111, 81, 0.1)' : 'var(--glass)'
                                }}
                                title={isBookmarked ? "Remove Bookmark" : "Bookmark Issue"}
                            >
                                <img
                                    src="https://img.icons8.com/?size=100&id=ttPVWWAN2Fak&format=png&color=000000"
                                    alt="Bookmark"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        filter: theme === 'dark' ? 'invert(1) brightness(10)' : 'none'
                                    }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '1.5rem' }}>
                {/* Summary Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/* Segmented Group for Labels */}
                    <div className="glass" style={{
                        display: 'flex',
                        padding: '0.25rem',
                        borderRadius: '0.75rem',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e5e5',
                        border: '1px solid var(--border)'
                    }}>
                        {['opposition', 'neutral', 'government'].map((tab) => {
                            const hasContent = tab === 'opposition' ? issue.summarize_oposisi :
                                tab === 'neutral' ? issue.summarize_netral :
                                    issue.summarize_pro_pemerintah;

                            const getActiveColor = () => {
                                if (tab === 'opposition') return '#e91e63'; // Pink Brave
                                if (tab === 'neutral') return '#ffffff';    // White
                                if (tab === 'government') return '#2a9d8f'; // Hero Green
                                return 'var(--primary)';
                            };

                            return (
                                <button
                                    key={tab}
                                    onClick={() => hasContent && setActiveTab(tab as any)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        width: '140px',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: activeTab === tab ? getActiveColor() : 'transparent',
                                        color: activeTab === tab
                                            ? (tab === 'neutral' ? '#171717' : '#fff')
                                            : 'var(--text-muted)',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        cursor: hasContent ? 'pointer' : 'not-allowed',
                                        opacity: hasContent ? 1 : 0.4,
                                        transition: 'all 0.2s ease',
                                        textTransform: 'capitalize',
                                        textAlign: 'center'
                                    }}
                                    title={!hasContent ? `No ${tab} summary available` : ''}
                                >
                                    {tab === 'government' ? 'Pro Government' : tab}
                                </button>
                            );
                        })}
                    </div>

                    {/* Separate Button for Full Comparison */}
                    <button
                        onClick={() => issue.summarize_all && setActiveTab('all')}
                        className="glass"
                        style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: '0.75rem',
                            border: `1px solid ${activeTab === 'all' ? 'var(--text)' : 'var(--border)'}`,
                            background: activeTab === 'all' ? 'var(--glass)' : 'transparent',
                            color: activeTab === 'all' ? 'var(--text)' : 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: issue.summarize_all ? 'pointer' : 'not-allowed',
                            opacity: issue.summarize_all ? 1 : 0.4
                        }}
                        title={!issue.summarize_all ? 'No comparison analysis available' : ''}
                    >
                        AI Bias Comparison
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', marginBottom: '4rem' }}>
                    {/* AI Analysis Section */}
                    <main>
                        <section className="glass" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
                            {/* Content based on active tab with custom spacing */}
                            {(() => {
                                const content = activeTab === 'all' ? issue.summarize_all :
                                    activeTab === 'opposition' ? issue.summarize_oposisi :
                                        activeTab === 'neutral' ? issue.summarize_netral :
                                            issue.summarize_pro_pemerintah;

                                if (!content) {
                                    return (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                            No {activeTab === 'all' ? 'analysis' : 'summary'} available yet.
                                        </p>
                                    );
                                }

                                return content.split('\n').filter((p: string) => p.trim() !== '').map((point: string, idx: number) => {
                                    // Remove existing dashes or dots if present at start
                                    const cleanPoint = point.replace(/^[-\s•*]+/, '').trim();

                                    return (
                                        <div key={idx} style={{
                                            marginBottom: '1rem',
                                            lineHeight: '1.2',
                                            color: 'var(--text)',
                                            fontSize: '1.05rem',
                                            display: 'flex',
                                            gap: '0.75rem'
                                        }}>
                                            <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>•</span>
                                            <span>{cleanPoint}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </section>

                        {/* Divider Line */}
                        <div style={{ borderTop: '1px solid var(--border)', marginTop: '3rem' }} />

                        {/* News Sources - Moved inside main */}
                        <section style={{ marginTop: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Articles</h2>
                                    <span style={{ padding: '0.3rem 0.8rem', background: 'var(--glass)', borderRadius: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {relatedNews.filter(n => newsFilter === 'all' || n.label === newsFilter).length} articles
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'oposisi', label: 'Opposition' },
                                        { id: 'netral', label: 'Neutral' },
                                        { id: 'pro_pemerintah', label: 'Pro Government' }
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setNewsFilter(f.id as any)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid var(--border)',
                                                background: newsFilter === f.id
                                                    ? (f.id === 'oposisi' ? '#e91e63' : f.id === 'pro_pemerintah' ? '#2a9d8f' : 'var(--text)')
                                                    : 'var(--glass)',
                                                color: newsFilter === f.id
                                                    ? (f.id === 'oposisi' || f.id === 'pro_pemerintah' ? '#fff' : 'var(--bg)')
                                                    : 'var(--text-muted)',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                {relatedNews
                                    .filter(n => newsFilter === 'all' || n.label === newsFilter)
                                    .map(n => (
                                        <a
                                            key={n.id}
                                            href={n.link_article}
                                            onClick={(e) => handleArticleClick(n.id, n.link_article, e)}
                                            rel="noopener noreferrer"
                                            className="glass"
                                            style={{
                                                padding: '1rem',
                                                display: 'flex',
                                                gap: '1rem',
                                                transition: 'transform 0.2s ease',
                                                color: 'var(--text)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ width: '80px', height: '60px', flexShrink: 0, borderRadius: '0.4rem', overflow: 'hidden' }}>
                                                <img
                                                    src={n.img_url || 'https://via.placeholder.com/100x75'}
                                                    alt={n.source}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {n.title}
                                                </p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                                        <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.75rem' }}>{n.source}</span>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{formatRelativeTime(n.created_at)}</span>
                                                    </div>

                                                    {n.label && (
                                                        <span style={{
                                                            padding: '0.15rem 0.5rem',
                                                            borderRadius: '0.3rem',
                                                            background: n.label === 'oposisi' ? 'rgba(255, 61, 113, 0.1)' :
                                                                n.label === 'pro_pemerintah' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid var(--border)',
                                                            color: n.label === 'oposisi' ? '#FF3D71' :
                                                                n.label === 'pro_pemerintah' ? '#2ECC71' : 'var(--text-muted)',
                                                            fontSize: '0.55rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.02em'
                                                        }}>
                                                            {n.label === 'oposisi' ? 'Lean Opposition' :
                                                                n.label === 'pro_pemerintah' ? 'Lean Pro Government' : 'Neutral'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                            </div>
                        </section>
                    </main>

                    {/* Sidebar Analytics */}
                    <aside style={{ borderLeft: '1px solid var(--border)', paddingLeft: '3rem' }}>
                        <div className="glass" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 800 }}>Issue Details</h2>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Sources</span>
                                    <span style={{ fontWeight: 700 }}>{stats.total}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Opposition</span>
                                    <span style={{ fontWeight: 700 }}>{stats.opposition}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Neutral</span>
                                    <span style={{ fontWeight: 700 }}>{stats.neutral}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Pro Government</span>
                                    <span style={{ fontWeight: 700 }}>{stats.proGovernment}</span>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Bias Distribution</p>
                                    {dominance && (
                                        <p style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                                            {dominance.percent}% {dominance.label}
                                        </p>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Last updated</p>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                        {(() => {
                                            const ds = issue.timemodified || issue.created_at;
                                            if (!ds) return 'Never';

                                            try {
                                                const normalizedDs = (ds.includes('T') || ds.includes(' ')) &&
                                                    !ds.endsWith('Z') &&
                                                    !ds.includes('+') &&
                                                    !/-\d{2}:\d{2}$/.test(ds)
                                                    ? `${ds.replace(' ', 'T')}Z`
                                                    : ds;
                                                const date = new Date(normalizedDs);
                                                if (isNaN(date.getTime())) return 'Invalid date';

                                                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                                            } catch (e) {
                                                return 'Invalid date';
                                            }
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Media Bias Analysis Grid - New Section */}
                        <div className="glass" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 800 }}>Media Bias Distribution</h2>

                            {/* 7-Bar Spectrum UI */}
                            <div style={{
                                display: 'flex',
                                gap: '4px',
                                height: '280px',
                                alignItems: 'flex-end',
                                paddingBottom: '2.5rem',
                                position: 'relative',
                                marginBottom: '1rem'
                            }}>
                                {mediaSpectrum.map((medias, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            flex: 1,
                                            height: '100%',
                                            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                            borderRadius: '0.4rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            padding: '0.5rem 0',
                                            gap: '0.4rem',
                                            borderBottom: idx === 0 ? '3px solid #e91e63' :
                                                idx === 3 ? '3px solid var(--text-muted)' :
                                                    idx === 6 ? '3px solid #2a9d8f' : '1px solid var(--border)'
                                        }}
                                    >
                                        {medias.map((media, mIdx) => (
                                            <div key={mIdx} title={`${media.name} (${Math.round(media.score * 100)}%)`} style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                background: '#fff',
                                                border: '2px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '2px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                flexShrink: 0
                                            }}>
                                                <img src={media.logo} alt={media.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                {/* Labels for Spectrum */}
                                <div style={{ position: 'absolute', bottom: '0.5rem', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <span style={{ color: '#e91e63' }}>Opposition</span>
                                    <span>Neutral</span>
                                    <span style={{ color: '#2a9d8f' }}>Pro Gov</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                                Position based on dominant news labels for this issue.
                            </p>

                        </div>
                    </aside>
                </div>

                <Footer />
            </div>
            {/* Auth Modal */}
            {showAuthModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3000,
                    padding: '2rem'
                }} onClick={() => setShowAuthModal(false)}>
                    <div
                        className="glass"
                        style={{
                            padding: '3rem',
                            maxWidth: '450px',
                            textAlign: 'center',
                            background: 'var(--bg)',
                            border: '1px solid var(--primary)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Account Required</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Login or create account to use the bookmark feature and other personalized options.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link href="/login" className="btn btn-primary" style={{ padding: '0.8rem' }}>
                                Login
                            </Link>
                            <Link href="/register" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                Don't have an account? Create account
                            </Link>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    marginTop: '1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInUp {
                    from { transform: translate(-50%, 10px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
