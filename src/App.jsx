import { useState, useEffect } from 'react';
import { useCricketGame } from './hooks/useCricketGame';
import { generateCommentary } from './services/gemini';
import { verifyKey, encryptData, decryptData } from './services/gemini';
import Scoreboard from './components/Scoreboard';
import Controls from './components/Controls';
import CommentaryFeed from './components/CommentaryFeed';
import Settings from './components/Settings';
import Scene from './components/3d/Scene'; // Import 3D Scene
import './App.css';

function App() {
  const { gameState, bowlBall, resetGame, addCommentary } = useCricketGame();
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('English');
  const [showSettings, setShowSettings] = useState(false);
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  // Load key on mount
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

  const handleBowl = async () => {
    const result = bowlBall();
    if (result) {
      // Basic game commentary immediate
      const basicText = `${result.bowler} bowls to ${result.batsman}. ${result.runs} runs. ${result.type}!`;
      addCommentary(basicText);

      // Gemini Commentary
      if (apiKey) {
        setLoadingCommentary(true);
        try {
          const commentary = await generateCommentary(apiKey, result, language);
          addCommentary(`🎙️ Gemini: ${commentary}`);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingCommentary(false);
        }
      }
    }
  };

  const saveSettings = (key, lang) => {
    setApiKey(key);
    setLanguage(lang);
    setShowSettings(false);
  };

  return (
    <div className="app-container-3d">

      {/* 3D Scene Background */}
      <div className="scene-wrapper">
        <Scene />
      </div>

      {/* UI Overlay */}
      <div className="ui-overlay">
        <header className="broadcast-header">
          <div className="logo">🏏 CricketMania AI</div>
          <button className="settings-icon" onClick={() => setShowSettings(!showSettings)}>
            ⚙️
          </button>
        </header>

        {showSettings && (
          <div className="modal-overlay">
            <div className="modal-content">
              <Settings onSave={saveSettings} />
              <button className="close-btn" onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        )}

        <main className="broadcast-layout">
          <section className="live-action">
            {/* Center area for 3D view (transparent) */}
            <div className="scanner-overlay">
              {gameState.scanner !== "Ready" && (
                <div className={`scanner-toast ${gameState.scanner === "OUT!" ? "wicket" : ""}`}>
                  {gameState.scanner}
                </div>
              )}
            </div>
          </section>

          <section className="broadcast-controls">
            <Controls
              onBowl={handleBowl}
              disabled={gameState.isGameOver || loadingCommentary}
            />
          </section>

          <section className="broadcast-footer">
            <div className="score-ticker">
              <Scoreboard
                score={gameState.score}
                wickets={gameState.wickets}
                overs={gameState.overs}
              />
            </div>
            <div className="commentary-ticker">
              <CommentaryFeed commentary={gameState.commentary} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
