'use client';

import Link from 'next/link';

export default function AboutPage() {
    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Header Hero */}
            <div style={{
                background: 'linear-gradient(to bottom, rgba(231, 111, 81, 0.1), transparent)',
                padding: '2rem 0 1rem'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 className="hero-title">
                        About <span style={{ color: 'var(--primary)' }}>DibalikBerita</span>
                    </h1>
                    <p className="sub-hero-text">
                        Uncovering the hidden layers of news through AI-driven transparency and multi-perspective analysis.
                    </p>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '900px', marginTop: '1rem', marginBottom: '2.5rem' }}>
                <section className="glass static-content" style={{ padding: '2rem', marginBottom: '0' }}>
                    <h2 className="section-title">What is DibalikBerita?</h2>
                    <p>
                        DibalikBerita is an innovative AI-powered platform designed to provide clarity in the increasingly complex world of digital journalism. Our mission is to empower readers by revealing the underlying tendencies and potential biases within news articles, particularly in the realms of politics and public policy. By centralizing reporting from various media outlets, we offer a comprehensive view that allows users to see beyond a single narrative and understand the broader context of every story.
                    </p>

                    <h2 className="section-title" style={{ marginTop: '2rem' }}>Who We Serve</h2>
                    <p>
                        Our platform is built for general news enthusiasts, students, and academics who are passionate about maintaining a well-informed and balanced worldview. Whether you are a citizen looking to understand public policy from multiple angles or a researcher seeking to identify media trends, DibalikBerita provides the tools necessary to navigate the media landscape critically. We cater to those who refuse to be directed toward a single opinion and instead prefer to gather a balanced spectrum of perspectives before forming their own conclusions.
                    </p>

                    <h2 className="section-title" style={{ marginTop: '2rem' }}>Addressing the Challenges of Modern Information</h2>
                    <p>
                        In our validation process, we identified several critical pain points that modern readers face daily. Detecting implicit bias is often difficult and time-consuming, and the manual process of comparing different media outlets is highly inefficient. Furthermore, many consumers feel a strong need for access to original source material to verify information themselves. DibalikBerita directly addresses these challenges by automating the comparison process and highlighting media tendencies, all while ensuring that readers always have direct access to the original articles as their primary source of truth.
                    </p>

                    <p>
                        The impact of these information imbalances is significant; without a critical eye, there is a high risk of misconceptions regarding public issues. Our platform minimizes these risks by providing an objective environment where information consumption is balanced, and the time wasted on manual comparison is virtually eliminated.
                    </p>

                    <h2 className="section-title" style={{ marginTop: '2rem' }}>The Power of Critical Literacy and Transparency</h2>
                    <p>
                        We believe that critical reading is an essential skill for a healthy democracy. Being critical doesn't mean being cynical; it means asking the right questions about where information comes from and why it is presented in a certain way. Transparency is at the heart of our philosophy. By making the leanings of media outlets visible, we allow readers to understand the lens through which their news is filtered. This level of transparency is vital for fostering a society that values objectivity and informed discourse over sensationalism and bias.
                    </p>

                    <h2 className="section-title" style={{ marginTop: '2rem' }}>Our Team</h2>
                    <p>
                        The DibalikBerita team is based in Surabaya, Indonesia. This platform was born as a final project for our Applied AI course, driven by a shared commitment to using technology for social good. We operate with complete independence and are not funded by or affiliated with any political parties, corporations, or external organizations. Our goal is to provide a neutral, academic-driven approach to information analysis, ensuring that our AI implementations remain ethical, transparent, and dedicated solely to the benefit of our users.
                    </p>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <Link href="/" className="btn btn-primary" style={{ width: 'auto', padding: '0.8rem 2.5rem' }}>
                            Explore Issues Now
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
                    <Link href="/about" style={{ color: 'var(--primary)', fontWeight: 700 }}>About Us</Link>
                    <Link href="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
                    <Link href="/contact" style={{ color: 'inherit' }}>Contact</Link>
                </div>
                <div>© {new Date().getFullYear()} DibalikBerita. Uncovering the facts behind the news.</div>
            </footer>
        </div>
    );
}
