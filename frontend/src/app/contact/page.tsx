'use client';

import Link from 'next/link';

export default function ContactPage() {
    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Header Hero */}
            <div style={{
                background: 'linear-gradient(to bottom, rgba(231, 111, 81, 0.1), transparent)',
                padding: '2rem 0 1rem'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 className="hero-title">
                        Get in <span style={{ color: 'var(--primary)' }}>Touch</span>
                    </h1>
                    <p className="sub-hero-text">
                        Have questions, feedback, or encountered an issue? We're here to help.
                    </p>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '800px', marginTop: '1rem', marginBottom: '2.5rem' }}>
                <section className="glass static-content" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✉️</div>
                    <h2 className="section-title">Contact Us</h2>
                    <p style={{ fontSize: '1.1rem' }}>
                        If you have any questions about our AI analysis, or if you've encountered any issues while using the platform, please do not hesitate to reach out to us. We value your feedback as it helps us improve the DibalikBerita experience for everyone.
                    </p>

                    <div style={{
                        background: 'var(--glass)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        border: '1px solid var(--border)',
                        display: 'inline-block',
                        width: '100%',
                        maxWidth: '500px'
                    }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Email Address
                        </p>
                        <a href="mailto:db.feedback@gmail.com" style={{
                            fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                            color: 'var(--primary)',
                            fontWeight: 800,
                            textDecoration: 'none',
                            wordBreak: 'break-all'
                        }}>
                            db.feedback@gmail.com
                        </a>
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <Link href="/" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                            Back to Homepage
                        </Link>
                    </div>
                </section>
            </div>

            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '3rem 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
            }}>
                <div className="footer-logo">
                    Dibalik<span style={{ color: 'var(--primary)' }}>Berita</span>
                </div>
                <div className="footer-links">
                    <Link href="/about" style={{ color: 'inherit' }}>About Us</Link>
                    <Link href="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
                    <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: 700 }}>Contact</Link>
                </div>
                <div>© {new Date().getFullYear()} DibalikBerita. Uncovering the facts behind the news.</div>
            </footer>
        </div>
    );
}
