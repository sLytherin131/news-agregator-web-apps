'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from './lib/api';
import Link from 'next/link';
import Footer from './components/Footer';

export default function HomePage() {
  const [hotIssues, setHotIssues] = useState<any[]>([]);
  const [latestIssues, setLatestIssues] = useState<any[]>([]);
  const [randomIssues, setRandomIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    async function fetchData() {
      try {
        const [hot, latest, random] = await Promise.all([
          apiRequest('/issues/hot?limit=5'),
          apiRequest('/issues/latest?limit=10'),
          apiRequest('/issues/random?limit=50')
        ]);
        setHotIssues(hot);
        setLatestIssues(latest);
        setRandomIssues(random);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredIssue = hotIssues[0];
  const otherHotIssues = hotIssues.slice(1);
  const visibleRandom = randomIssues.slice(0, displayCount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper for distribution bar
  const renderDistributionBar = (counts: any, total: number, showDominance = false) => {
    if (!counts || total === 0) return null;
    const oppPercent = (counts.opposition / total) * 100;
    const neuPercent = (counts.neutral / total) * 100;
    const proPercent = (counts.pro_government / total) * 100;

    // Calculate dominance
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
          width: '70px', // Slightly narrower for sidebar
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.1)'
        }}>
          <div style={{ width: `${oppPercent}%`, background: '#e91e63' }} title="Opposition" />
          <div style={{ width: `${neuPercent}%`, background: '#FFFFFF' }} title="Neutral" />
          <div style={{ width: `${proPercent}%`, background: '#2a9d8f' }} title="Pro Government" />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{total} sources</span>
        {showDominance && (
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
            • {dominantPercent}% {dominantLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      <header style={{
        marginBottom: '4rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '3rem'
      }}>
        <h1 className="hero-title">
          Uncover the <span style={{ color: 'var(--primary)' }}>Truth</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
          Detect bias and explore multiple perspectives with our AI-powered news analysis platform.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Searching for latest issues...</p>
        </div>
      ) : (
        <>
          <div className="responsive-grid-home">
            {/* LEFT COLUMN: HOT ISSUES */}
            <section style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{
                fontSize: '1.75rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                HOT Issues
              </h2>

              {featuredIssue && (
                <Link href={`/issues/${featuredIssue.id}`}>
                  <article className="glass" style={{ overflow: 'hidden', marginBottom: '1.5rem', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
                    <div style={{ position: 'relative', height: '300px' }}>
                      <img
                        src={featuredIssue.representative_image || 'https://via.placeholder.com/800x400'}
                        alt={featuredIssue.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '1.5rem',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        color: '#fff'
                      }}>
                        <span style={{
                          background: 'var(--primary)',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.4rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          marginBottom: '0.5rem',
                          display: 'inline-block'
                        }}>TRENDING #1</span>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: '1.2' }}>{featuredIssue.title}</h3>
                      </div>
                    </div>
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', opacity: 0.8, fontSize: '0.8rem' }}>
                          <span>{featuredIssue.view_count || 0} views</span>
                          <span>{formatDate(featuredIssue.created_at)}</span>
                        </div>
                        {renderDistributionBar(featuredIssue.label_counts, featuredIssue.news_count)}
                      </div>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>Read</span>
                    </div>
                  </article>
                </Link>
              )}

              <div style={{ display: 'grid', gap: '1rem' }}>
                {otherHotIssues.map((item, index) => (
                  <Link key={item.id} href={`/issues/${item.id}`}>
                    <article className="glass" style={{
                      padding: '1rem',
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'center',
                      cursor: 'pointer',
                      height: '90px' // Fix height to match right col
                    }}>
                      <div style={{
                        width: '80px',
                        height: '60px',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        <img
                          src={item.representative_image || 'https://via.placeholder.com/80x60'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span>#{index + 2} Trending</span>
                          <span>•</span>
                          <span>{item.view_count} views</span>
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                          {renderDistributionBar(item.label_counts, item.news_count)}
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>

            {/* RIGHT COLUMN: LATEST ISSUES */}
            <aside className="home-aside">
              <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                Latest Issues
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                {latestIssues.map((item, idx) => (
                  <Link key={item.id} href={`/issues/${item.id}`}>
                    <article style={{
                      borderBottom: idx === latestIssues.length - 1 ? 'none' : '1px solid var(--border)',
                      paddingBottom: '0.75rem',
                      marginBottom: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                        {new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.4', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        {item.title}
                      </h3>
                      <div style={{ opacity: 0.9 }}>
                        {renderDistributionBar(item.label_counts, item.news_count, true)}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </aside>
          </div>

          {/* SECTION BREAK */}
          <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '4rem' }}></div>

          {/* DISCOVER SECTION: RANDOM ISSUES */}
          <section style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'center' }}>
              Discover More Issues
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {visibleRandom.map(item => (
                <Link key={item.id} href={`/issues/${item.id}`}>
                  <div className="glass" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '180px' }}>
                      <img
                        src={item.representative_image || 'https://via.placeholder.com/400x200'}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatDate(item.created_at)}
                        </span>
                        {renderDistributionBar(item.label_counts, item.news_count)}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: '1.4', flex: 1 }}>{item.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>Read</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.view_count} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {displayCount < randomIssues.length && (
              <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <button
                  onClick={() => setDisplayCount(prev => prev + 6)}
                  className="btn"
                  style={{
                    width: 'auto',
                    padding: '1rem 3rem',
                    background: 'var(--glass)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '2rem'
                  }}
                >
                  View More Issues
                </button>
              </div>
            )}
          </section>

          <Footer />
        </>
      )}
    </div>
  );
}
