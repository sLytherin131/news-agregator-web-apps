'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            router.push('/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setFullName(parsedUser.full_name || '');
            setEmail(parsedUser.email || '');
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await apiRequest('/auth/profile/update', {
                method: 'PUT',
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    password: password || undefined
                })
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Update local storage if successful
            if (res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
                setUser(res.user);
                // Trigger navbar sync
                window.dispatchEvent(new Event('userUpdate'));
            }

            // Clear password field
            setPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div className="container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            color: 'var(--text)'
        }}>
            <h3>Loading user profile...</h3>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
            <div className="glass form-container" style={{ margin: '0 auto 2rem', maxWidth: '500px' }}>
                <h1 className="form-title">Your Profile</h1>
                <p className="form-subtitle">Update your personal information</p>

                {message.text && (
                    <div className={`message ${message.type}`} style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: message.type === 'error' ? 'var(--error)' : 'var(--success)',
                        fontSize: '0.9rem',
                        border: `1px solid ${message.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            autoComplete="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            placeholder="Leave blank to keep current"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Saving Changes...' : 'Save'}
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
}
