'use client';

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Header Hero */}
            <div style={{
                background: 'linear-gradient(to bottom, rgba(231, 111, 81, 0.1), transparent)',
                padding: '2rem 0 1rem'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 className="hero-title">
                        Privacy <span style={{ color: 'var(--primary)' }}>Policy</span>
                    </h1>
                    <p className="sub-hero-text">
                        Your privacy matters to us. Learn how we handle information at DibalikBerita.
                    </p>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '900px', marginTop: '1rem', marginBottom: '2.5rem' }}>
                <section className="glass static-content" style={{ padding: '2rem' }}>
                    <h2 className="section-title" style={{ fontSize: '1.5rem' }}>1. Introduction</h2>
                    <p>
                        Welcome to DibalikBerita. We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy outlines our practices regarding information collection and use while you navigate our AI-powered news analysis site.
                    </p>

                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>2. Information Collection</h2>
                    <p style={{ marginBottom: '1rem' }}>
                        At DibalikBerita, we prioritize transparency and data minimization. We collect:
                    </p>
                    <ul style={{ lineHeight: '1.7', color: 'var(--text)', marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                        <li><strong>Usage Data:</strong> We track anonymous interactions, such as viewed news issues (View Count), to power our "HOT Issues" section. This does not include personally identifiable information for guest users.</li>
                        <li><strong>Cookies:</strong> We use essential cookies to maintain session states and improve site performance.</li>
                        <li><strong>Analytical Data:</strong> Anonymous technical data like browser type and device information may be processed to optimize our UI/UX.</li>
                    </ul>

                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>3. How We Use Information</h2>
                    <p>
                        The information we collect is used solely to provide and improve our services. This includes determining trending topics, refining our AI bias detection models, and ensuring the platform remains secure and functional for all users.
                    </p>

                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>4. Data Sharing and Security</h2>
                    <p>
                        We do not sell, trade, or rent your personal information to third parties. DibalikBerita is an academic project dedicated to information transparency. We implement robust security measures to protect any data processed by our system against unauthorized access or disclosure.
                    </p>

                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>5. Third-Party Links</h2>
                    <p>
                        Our platform contains links to various original news sources. Please be aware that we are not responsible for the privacy practices of these external sites. We encourage users to read the privacy statements of any site that collects personally identifiable information.
                    </p>

                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>6. Policy Changes</h2>
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated effective date.
                    </p>

                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem' }}>7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:db.feedback@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>db.feedback@gmail.com</a>.
                    </p>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
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
                    <Link href="/privacy" style={{ color: 'var(--primary)', fontWeight: 700 }}>Privacy</Link>
                    <Link href="/contact" style={{ color: 'inherit' }}>Contact</Link>
                </div>
                <div>© {new Date().getFullYear()} DibalikBerita. Uncovering the facts behind the news.</div>
            </footer>
        </div>
    );
}
