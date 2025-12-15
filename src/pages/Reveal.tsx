import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.JPG';

const Reveal: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<{ isim: string; soyisim: string } | null>(null);
    const [matchName, setMatchName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = sessionStorage.getItem('secret-santa-user');
        if (!storedUser || !id) {
            navigate('/');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id !== id) {
            // Security check: trying to access someone else's ID URL
            navigate('/');
            return;
        }

        setUser(parsedUser);

        // Check if we already revealed locally (optional, but requested behavior is stateless reveal click)
        const localMatch = localStorage.getItem(`match-for-${id}`);
        if (localMatch) {
            setMatchName(localMatch);
        }
    }, [id, navigate]);

    const handleReveal = async () => {
        if (matchName) return; // Already revealed

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/.netlify/functions/reveal?id=${id}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Eşleşme bulunamadı.');
            }

            const data = await response.json();
            setMatchName(data.receiverName);
            localStorage.setItem(`match-for-${id}`, data.receiverName);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="snow-overlay" />
            <div className="container">
                <div className="card">
                    <img src={logo} alt="Secret Santa Logo" className="brand-logo" />
                    <h2 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
                        Merhaba, <span className="highlight">{user.isim}</span>!
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                        Hediye alacağın kişiyi öğrenmeye hazır mısın?
                    </p>

                    {!matchName ? (
                        <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {error ? (
                                <div style={{ color: '#ef4444' }}>{error}</div>
                            ) : (
                                <button onClick={handleReveal} className="btn" disabled={loading}>
                                    {loading ? 'Kura Çekiliyor...' : '🎁 Kime Hediye Aldığımı Gör'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="reveal-content">
                            <div style={{
                                margin: '2rem 0',
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                border: '2px solid var(--color-accent)'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    Hediye Alacağın Kişi:
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                    {matchName}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                🤫 Şşşt, aramızda kalsın!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Reveal;
