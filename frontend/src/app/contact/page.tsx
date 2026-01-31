'use client';

import Link from 'next/link';

export default function ContactPage() {
    return (
        <div style={{ paddingBottom: '5rem' }}>
            {/* Header Hero */}
            <div style={{
                background: 'linear-gradient(to bottom, rgba(231, 111, 81, 0.1), transparent)',
                padding: '1.5rem 0 1rem'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        marginBottom: '0.5rem',
                        lineHeight: '1.1',
                        letterSpacing: '-0.02em'
                    }}>
                        Get in <span style={{ color: 'var(--primary)' }}>Touch</span>
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.25rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Have questions, feedback, or encountered an issue? We're here to help.
                    </p>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '800px', marginTop: '1rem', marginBottom: '2.5rem' }}>
                <section className="glass" style={{ padding: '3.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>✉️</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Contact Us</h2>
                    <p style={{ lineHeight: '1.8', fontSize: '1.15rem', color: 'var(--text)', marginBottom: '2.5rem' }}>
                        If you have any questions about our AI analysis, or if you've encountered any issues while using the platform, please do not hesitate to reach out to us. We value your feedback as it helps us improve the DibalikBerita experience for everyone.
                    </p>

                    <div style={{
                        background: 'var(--glass)',
                        padding: '2rem',
                        borderRadius: '1rem',
                        border: '1px solid var(--border)',
                        display: 'inline-block',
                        width: '100%',
                        maxWidth: '500px'
                    }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Email Address
                        </p>
                        <a href="mailto:db.feedback@gmail.com" style={{
                            fontSize: '1.5rem',
                            color: 'var(--primary)',
                            fontWeight: 800,
                            textDecoration: 'none'
                        }}>
                            db.feedback@gmail.com
                        </a>
                    </div>

                    <div style={{ marginTop: '4rem' }}>
                        <Link href="/" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                            Back to Homepage
                        </Link>
                    </div>
                </section>
            </div>

            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '4rem 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
            }}>
                <div style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>
                    Dibalik<span style={{ color: 'var(--primary)' }}>Berita</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <Link href="/about" style={{ color: 'inherit' }}>About Us</Link>
                    <Link href="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
                    <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: 700 }}>Contact</Link>
                </div>
                <div>© {new Date().getFullYear()} DibalikBerita. Uncovering the facts behind the news.</div>
            </footer>
        </div>
    );
}
