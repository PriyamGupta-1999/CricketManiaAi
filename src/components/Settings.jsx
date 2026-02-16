import React, { useState, useEffect } from 'react';
import { verifyKey, encryptData, decryptData } from '../services/gemini';

const Settings = ({ onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [language, setLanguage] = useState('English');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            try {
                const decrypted = decryptData(savedKey);
                if (decrypted) {
                    setApiKey(decrypted);
                    // trigger save on load if valid key exists
                    onSave(decrypted, 'English');
                }
            } catch (e) {
                console.error("Failed to load key", e);
            }
        }
    }, []);

    const handleSave = async () => {
        if (!apiKey) {
            setStatus({ type: 'error', msg: 'Please enter an API Key.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', msg: 'Verifying API Key...' });

        const isValid = await verifyKey(apiKey);

        setLoading(false);
        if (isValid) {
            const encryptedKey = encryptData(apiKey);
            localStorage.setItem('gemini_api_key', encryptedKey);

            setStatus({ type: 'success', msg: 'Valid Key! Encrypted & Saved.' });
            setTimeout(() => {
                onSave(apiKey, language);
            }, 1000);
        } else {
            setStatus({ type: 'error', msg: 'Invalid API Key. Please check.' });
        }
    };

    return (
        <div className="settings">
            <h2>Game Settings</h2>
            <div className="form-group">
                <label>Gemini API Key:</label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API Key"
                    disabled={loading}
                />
                {apiKey && <small style={{ color: '#666' }}>Key will be encrypted locally.</small>}
            </div>
            <div className="form-group">
                <label>Commentary Language:</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={loading}
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                </select>
            </div>

            {status.msg && (
                <div className={`status-msg ${status.type}`} style={{
                    marginBottom: '15px',
                    padding: '10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    backgroundColor: status.type === 'error' ? '#ffebee' : status.type === 'success' ? '#e8f5e9' : '#e3f2fd',
                    color: status.type === 'error' ? '#c62828' : status.type === 'success' ? '#2e7d32' : '#1565c0'
                }}>
                    {status.msg}
                </div>
            )}

            <button onClick={handleSave} className="save-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Save'}
            </button>
        </div>
    );
};

export default Settings;
