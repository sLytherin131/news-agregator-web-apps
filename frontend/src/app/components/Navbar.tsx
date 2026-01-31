'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const syncUser = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            } else {
                setUser(null);
            }
        };

        syncUser();

        // Listen for internal profile updates
        window.addEventListener('userUpdate', syncUser);

        // Load theme
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
        setTheme(savedTheme);
        document.documentElement.dataset.theme = savedTheme;

        return () => window.removeEventListener('userUpdate', syncUser);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.dataset.theme = newTheme;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    return (
        <>
            <nav className="navbar">
                <div className="container nav-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                    {/* Left: Burger Button */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <button className="burger-btn" onClick={() => setIsSidebarOpen(true)}>
                            ☰
                        </button>
                    </div>

                    {/* Center: Logo Image */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={theme === 'dark' ? '/dark_theme.jpg' : '/light_theme.jpg'}
                                alt="DiBalikBerita"
                                style={{ height: '60px', width: 'auto', objectFit: 'contain', display: 'block' }}
                            />
                        </Link>
                    </div>

                    {/* Right: User Info */}
                    <div className="nav-links" style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', display: 'flex' }}>
                        {user ? (
                            <span className="nav-link">Hi, {user.full_name.split(' ')[0]}</span>
                        ) : (
                            <>
                                <Link href="/login" className="nav-link">Login</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar Drawer */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Menu</h2>
                    <button className="burger-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
                </div>

                <div className="sidebar-content">
                    <Link href="/" onClick={() => setIsSidebarOpen(false)} className="nav-link">Home</Link>
                    {user && (
                        <>
                            <Link href="/profile" onClick={() => setIsSidebarOpen(false)} className="nav-link">Profile</Link>
                            <Link href="/bookmarks" onClick={() => setIsSidebarOpen(false)} className="nav-link">Bookmarks</Link>
                            <Link href="/history" onClick={() => setIsSidebarOpen(false)} className="nav-link">History</Link>
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="nav-link">Admin Panel</Link>
                    )}

                    {user ? (
                        <span onClick={handleLogout} className="nav-link" style={{ cursor: 'pointer' }}>Logout</span>
                    ) : (
                        <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="nav-link">Login</Link>
                    )}

                    <div className="theme-section">
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Themes</p>
                        <button className="theme-toggle" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img
                                src={theme === 'dark'
                                    ? 'https://img.icons8.com/?size=100&id=GIywaBFJCJiI&format=png&color=000000'
                                    : 'https://img.icons8.com/?size=100&id=FwypVM1CXDbT&format=png&color=000000'
                                }
                                alt={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    filter: theme === 'dark' ? 'invert(1) brightness(10)' : 'none'
                                }}
                            />
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
