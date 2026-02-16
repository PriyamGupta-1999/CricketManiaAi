import { useState, useEffect } from 'react';
import { useCricketGame } from './hooks/useCricketGame';
import { generateCommentary } from './services/gemini';
import Scoreboard from './components/Scoreboard';
import Controls from './components/Controls';
import CommentaryFeed from './components/CommentaryFeed';
import Settings from './components/Settings';
import './App.css';

function App() {
  const { gameState, bowlBall, resetGame, addCommentary } = useCricketGame();
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('English');
  const [showSettings, setShowSettings] = useState(true);
  const [loadingCommentary, setLoadingCommentary] = useState(false);

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
    <div className="app-container">
      <header>
        <h1>🏏 Super Over Cricket</h1>
        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
          ⚙️ Settings
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


      <main className="game-layout">
        <section className="left-panel">
          <Scoreboard
            score={gameState.score}
            wickets={gameState.wickets}
            overs={gameState.overs}
          />
          <div className="scanner-display">
            <h2>{gameState.scanner}</h2>
          </div>
          <Controls
            onBowl={handleBowl}
            disabled={gameState.isGameOver || loadingCommentary}
          />
          {gameState.isGameOver && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
        </section>

        <section className="right-panel">
          <CommentaryFeed commentary={gameState.commentary} />
        </section>
      </main>
    </div>
  );
}

export default App;
