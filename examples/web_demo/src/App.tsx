import React, { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { SolanaParser, TransactionView, ParsedResult } from '../../../src/index';
import { Buffer } from 'buffer';
import { MOCK_DATA } from './mock-data';

// Polyfill Buffer for browser
window.Buffer = Buffer;

export const App: React.FC = () => {
    const [rpcUrl, setRpcUrl] = useState('https://api.mainnet-beta.solana.com');
    const [txId, setTxId] = useState('');
    const [result, setResult] = useState<ParsedResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useMock, setUseMock] = useState(false);

    const handleDecode = async () => {
        if (!txId.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        // Check for mock data first if enabled or if it's one of our examples
        if (useMock || MOCK_DATA[txId.trim()]) {
            const mock = MOCK_DATA[txId.trim()];
            if (mock) {
                setTimeout(() => {
                    setResult(mock);
                    setLoading(false);
                }, 500);
                return;
            }
        }

        try {
            const connection = new Connection(rpcUrl, 'confirmed');
            const parser = new SolanaParser(connection);
            const parsed = await parser.parseTransaction(txId.trim());
            if (parsed) {
                setResult(parsed);
            } else {
                setError('Transaction not found. Ensure the signature is correct and the RPC has the transaction data.');
            }
        } catch (e: any) {
            console.error('Decoding error:', e);
            const is403 = e.message?.includes('403');

            if (is403 && MOCK_DATA[txId.trim()]) {
                setError('RPC blocked (403). Falling back to mock data...');
                setTimeout(() => {
                    setResult(MOCK_DATA[txId.trim()]);
                    setError(null);
                }, 1000);
            } else if (is403) {
                setError('RPC Error (403 Forbidden): The public Solana RPC often blocks requests from browsers. Please try a different RPC URL (e.g., Alchemy or Helius) or use a preset with mock data.');
            } else {
                setError(e.message || 'Error parsing transaction');
            }
        } finally {
            setLoading(false);
        }
    };

    const examples = [
        { label: 'SOL Transfer', id: '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj' },
        { label: 'USDC Transfer', id: '4vD3pSETPxuoMXrYhY3naJgfpEqyfqvv7xSfPvnTUXFp4y9FZv4v6vEpQPvHUfXmNLfVsVZHkZGkJWmz1xnfkPxL' },
        { label: 'Jupiter Swap', id: '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump' }
    ];

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '3rem 2rem',
            minHeight: '100vh',
            backgroundColor: '#050505',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <nav style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        background: 'linear-gradient(45deg, #9945FF, #14F195)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        Solana Tx Visualizer
                    </h1>
                    <p style={{ opacity: 0.5, margin: '0.2rem 0 0' }}>Deep transaction decoding for developers.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="https://github.com/smallyunet/solana-tx-decoder" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none', opacity: 0.7 }}>GitHub</a>
                </div>
            </nav>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 350px',
                gap: '2rem',
                marginBottom: '3rem'
            }}>
                <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.8rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem', opacity: 0.8 }}>Transaction Signature</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {examples.map(ex => (
                                    <button
                                        key={ex.label}
                                        onClick={() => setTxId(ex.id)}
                                        style={{
                                            backgroundColor: '#1a1a1a', color: '#aaa', border: '1px solid #333',
                                            padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
                                            fontSize: '0.75rem', transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#9945FF'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#aaa'; }}
                                    >
                                        {ex.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={txId}
                                onChange={(e) => setTxId(e.target.value)}
                                placeholder="Paste signature here..."
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #222',
                                    backgroundColor: '#111', color: '#fff', fontSize: '0.95rem', outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleDecode}
                                disabled={loading}
                                style={{
                                    padding: '0 2rem', borderRadius: '12px', border: 'none',
                                    background: 'linear-gradient(45deg, #9945FF, #14F195)', color: '#000',
                                    fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.1s, opacity 0.2s'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {loading ? '...' : 'Decode'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            color: '#FF4B4B', padding: '1rem', backgroundColor: 'rgba(255,75,75,0.05)',
                            borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,75,75,0.2)',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#111',
                    borderRadius: '16px',
                    border: '1px solid #222',
                    height: 'fit-content'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Settings</h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.6 }}>RPC Endpoint</label>
                        <input
                            type="text"
                            value={rpcUrl}
                            onChange={(e) => setRpcUrl(e.target.value)}
                            style={{
                                width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #333',
                                backgroundColor: '#000', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => setUseMock(!useMock)}>
                        <div style={{
                            width: '36px', height: '20px', backgroundColor: useMock ? '#14F195' : '#333',
                            borderRadius: '10px', position: 'relative', transition: 'background-color 0.2s'
                        }}>
                            <div style={{
                                width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%',
                                position: 'absolute', top: '2px', left: useMock ? '18px' : '2px',
                                transition: 'left 0.2s'
                            }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Use Mock Data (bypass RPC)</span>
                    </div>
                </div>
            </div>

            {result ? (
                <TransactionView result={result} />
            ) : (
                !loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem 0',
                        opacity: 0.2,
                        border: '2px dashed #222',
                        borderRadius: '24px'
                    }}>
                        <p style={{ fontSize: '1.2rem' }}>Enter a signature to begin visualizing</p>
                    </div>
                )
            )}
        </div>
    );
};
