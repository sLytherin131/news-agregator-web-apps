'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.role !== 'admin') {
            router.push('/');
            return;
        }

        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
                <p className="form-subtitle">Verifying admin access...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '3rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="form-title" style={{ color: 'var(--text)' }}>Admin Panel</h1>
                <p className="form-subtitle" style={{ color: 'var(--text-muted)' }}>Manage DibalikBerita content and system settings.</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
            }}>
                {/* News Management Card */}
                <Link href="/admin/news" className="glass" style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1.5rem',
                        background: 'var(--glass)',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        overflow: 'hidden'
                    }}>
                        <img
                            src="https://img.icons8.com/?size=100&id=532&format=png&color=000000"
                            alt="News"
                            style={{
                                width: '45px',
                                height: '45px',
                                filter: 'var(--icon-filter, invert(1))'
                            }}
                        />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>News</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        View, edit, and manage all published news articles.
                    </p>
                </Link>

                {/* Insert News Card */}
                <Link href="/admin/insert" className="glass" style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1.5rem',
                        background: 'var(--glass)',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        overflow: 'hidden'
                    }}>
                        <img
                            src="https://img.icons8.com/?size=100&id=34wrjWhzLuJa&format=png&color=000000"
                            alt="Insert News"
                            style={{
                                width: '45px',
                                height: '45px',
                                filter: 'var(--icon-filter, invert(1))'
                            }}
                        />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Insert News</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Manually add new news articles to the database.
                    </p>
                </Link>

                {/* Issues Management Card */}
                <Link href="/admin/issues" className="glass" style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1.5rem',
                        background: 'var(--glass)',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        overflow: 'hidden'
                    }}>
                        <img
                            src="https://img.icons8.com/?size=100&id=101807&format=png&color=000000"
                            alt="Issues"
                            style={{
                                width: '45px',
                                height: '45px',
                                filter: 'var(--icon-filter, invert(1))'
                            }}
                        />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Issues</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Manage grouped news issues and AI summaries.
                    </p>
                </Link>
            </div>
        </div>
    );
}
