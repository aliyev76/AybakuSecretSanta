import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [codeVal, setCodeVal] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!codeVal.trim() || codeVal.trim().length !== 5) {
            setError('Lütfen 5 haneli kodunuzu girin.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/.netlify/functions/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeVal }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Giriş yapılamadı.');
            }

            const user = await response.json();
            sessionStorage.setItem('secret-santa-user', JSON.stringify(user));
            navigate(`/reveal/${user.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="snow-overlay" />
            <div className="container">
                <div className="card">
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>🎅</h1>
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 700 }}>
                        Secret Santa <span className="highlight">2025</span>
                    </h2>

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label className="input-label">TC Kimlik No (Son 5 Hane)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="input-field"
                                placeholder="12345"
                                value={codeVal}
                                onChange={(e) => {
                                    // Only allow numbers
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 5) setCodeVal(val);
                                }}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn" disabled={loading || codeVal.length !== 5}>
                            {loading ? 'Kontrol Ediliyor...' : 'Giriş Yap'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
