import React, { useState, useEffect } from 'react';
import { verifyKey, encryptData, decryptData } from '../services/gemini';
import './MatchSetup.css';

const TEAMS = [
    { id: 'IND', name: 'India', color: '#1976d2', flag: '🇮🇳' },
    { id: 'AUS', name: 'Australia', color: '#fbc02d', flag: '🇦🇺' },
    { id: 'ENG', name: 'England', color: '#1565c0', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'PAK', name: 'Pakistan', color: '#2e7d32', flag: '🇵🇰' },
    { id: 'SA', name: 'South Africa', color: '#00695c', flag: '🇿🇦' },
    { id: 'NZ', name: 'New Zealand', color: '#212121', flag: '🇳🇿' },
    { id: 'WI', name: 'West Indies', color: '#6a1b9a', flag: '🏴' }
];

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'ar', name: 'Arabic' },
    { code: 'bn', name: 'Bengali' }
];

const MatchSetup = ({ onStartMatch }) => {
    const [teamA, setTeamA] = useState('IND');
    const [teamB, setTeamB] = useState('AUS');
    const [overs, setOvers] = useState(5);
    const [apiKey, setApiKey] = useState('');
    const [language, setLanguage] = useState('en');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Load saved settings
    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            try {
                const decrypted = decryptData(savedKey);
                if (decrypted) setApiKey(decrypted);
            } catch (e) {
                console.error("Failed to load key", e);
            }
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (teamA === teamB) {
            newErrors.teams = 'Please select different teams';
        }

        if (overs < 1 || overs > 20) {
            newErrors.overs = 'Overs must be between 1 and 20';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartMatch = () => {
        if (!validateForm()) {
            setStatus({ type: 'error', msg: 'Please fix the errors below' });
            return;
        }

        // Save API key if provided (skip verification to avoid blocking)
        if (apiKey) {
            const encryptedKey = encryptData(apiKey);
            localStorage.setItem('gemini_api_key', encryptedKey);
        }

        // Start game immediately
        const config = {
            teamA: TEAMS.find(t => t.id === teamA),
            teamB: TEAMS.find(t => t.id === teamB),
            overs,
            apiKey,
            language: LANGUAGES.find(l => l.code === language)?.name || 'English'
        };

        onStartMatch(config);
    };

    const startGame = () => {
        const config = {
            teamA: TEAMS.find(t => t.id === teamA),
            teamB: TEAMS.find(t => t.id === teamB),
            overs,
            apiKey,
            language: LANGUAGES.find(l => l.code === language)?.name || 'English'
        };

        onStartMatch(config);
    };

    const teamAData = TEAMS.find(t => t.id === teamA);
    const teamBData = TEAMS.find(t => t.id === teamB);

    return (
        <div className="match-setup-overlay">
            <div className="match-setup-container">
                <header className="setup-header">
                    <h1 className="setup-title">🏏 CricketMania AI</h1>
                    <p className="setup-subtitle">Configure your match settings</p>
                </header>

                <form className="setup-form" onSubmit={(e) => { e.preventDefault(); handleStartMatch(); }}>

                    {/* Team Selection */}
                    <fieldset className="form-section">
                        <legend className="section-title">Team Selection</legend>

                        {errors.teams && (
                            <div className="error-message" role="alert" aria-live="polite">
                                {errors.teams}
                            </div>
                        )}

                        <div className="teams-grid">
                            {/* Team A */}
                            <div className="form-group">
                                <label htmlFor="team-a" className="form-label">
                                    Team A (Batting First)
                                </label>
                                <div className="team-select-wrapper">
                                    <select
                                        id="team-a"
                                        value={teamA}
                                        onChange={(e) => setTeamA(e.target.value)}
                                        className="team-select"
                                        style={{ borderColor: teamAData?.color }}
                                        aria-describedby="team-a-desc"
                                    >
                                        {TEAMS.map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.flag} {team.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="team-preview" style={{ backgroundColor: teamAData?.color }}>
                                        <span className="team-flag">{teamAData?.flag}</span>
                                    </div>
                                </div>
                                <small id="team-a-desc" className="form-hint">Select the team batting first</small>
                            </div>

                            {/* VS Divider */}
                            <div className="vs-divider-setup" aria-hidden="true">VS</div>

                            {/* Team B */}
                            <div className="form-group">
                                <label htmlFor="team-b" className="form-label">
                                    Team B (Chasing)
                                </label>
                                <div className="team-select-wrapper">
                                    <select
                                        id="team-b"
                                        value={teamB}
                                        onChange={(e) => setTeamB(e.target.value)}
                                        className="team-select"
                                        style={{ borderColor: teamBData?.color }}
                                        aria-describedby="team-b-desc"
                                    >
                                        {TEAMS.map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.flag} {team.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="team-preview" style={{ backgroundColor: teamBData?.color }}>
                                        <span className="team-flag">{teamBData?.flag}</span>
                                    </div>
                                </div>
                                <small id="team-b-desc" className="form-hint">Select the team chasing</small>
                            </div>
                        </div>
                    </fieldset>

                    {/* Match Settings */}
                    <fieldset className="form-section">
                        <legend className="section-title">Match Settings</legend>

                        <div className="form-group">
                            <label htmlFor="overs" className="form-label">
                                Number of Overs: <strong>{overs}</strong>
                            </label>
                            <input
                                type="range"
                                id="overs"
                                min="1"
                                max="20"
                                value={overs}
                                onChange={(e) => setOvers(parseInt(e.target.value))}
                                className="overs-slider"
                                aria-describedby="overs-desc"
                            />
                            <div className="slider-labels">
                                <span>1</span>
                                <span>5</span>
                                <span>10</span>
                                <span>15</span>
                                <span>20</span>
                            </div>
                            <small id="overs-desc" className="form-hint">
                                Each team will play {overs} overs ({overs * 6} balls)
                            </small>
                            {errors.overs && (
                                <div className="error-message" role="alert">{errors.overs}</div>
                            )}
                        </div>
                    </fieldset>

                    {/* AI Commentary Settings */}
                    <fieldset className="form-section">
                        <legend className="section-title">AI Commentary (Optional)</legend>

                        <div className="form-group">
                            <label htmlFor="api-key" className="form-label">
                                Gemini API Key
                            </label>
                            <input
                                type="password"
                                id="api-key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your Gemini API key (optional)"
                                className="form-input"
                                aria-describedby="api-key-desc"
                                disabled={loading}
                            />
                            <small id="api-key-desc" className="form-hint">
                                Optional. Enables AI-powered commentary. Key is encrypted locally.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="language" className="form-label">
                                Commentary Language
                            </label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="form-select"
                                disabled={loading}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </fieldset>

                    {/* Status Messages */}
                    {status.msg && (
                        <div
                            className={`status-banner ${status.type}`}
                            role="alert"
                            aria-live="polite"
                        >
                            {status.msg}
                        </div>
                    )}

                    {/* Start Button */}
                    <button
                        type="submit"
                        className="start-match-btn"
                        disabled={loading}
                        aria-label="Start the cricket match"
                    >
                        {loading ? 'Verifying...' : '🏏 Start Match'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MatchSetup;
