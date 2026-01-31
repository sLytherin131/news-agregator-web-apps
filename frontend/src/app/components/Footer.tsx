'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            borderTop: '1px solid var(--border)',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            width: '100%',
            background: 'var(--bg)'
        }}>
            <div style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>
                Dibalik<span style={{ color: 'var(--primary)' }}>Berita</span>
            </div>
            <p style={{ marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                AI-powered news analysis platform to help you understand various perspectives
                and detect media bias objectively.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <Link href="/about" style={{ color: 'inherit' }}>About Us</Link>
                <Link href="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
                <Link href="/contact" style={{ color: 'inherit' }}>Contact</Link>
            </div>
            <div>© {new Date().getFullYear()} DibalikBerita. Uncovering the facts behind the news.</div>
        </footer>
    );
}
