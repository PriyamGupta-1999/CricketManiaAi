import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useCricketGame, GAME_PHASES } from './hooks/useCricketGame';
import { generateCommentary } from './services/gemini';
import Scoreboard from './components/Scoreboard';
import Controls from './components/Controls';
import CommentaryFeed from './components/CommentaryFeed';
import MatchSetup from './components/MatchSetup';
import Settings from './components/Settings';
import { isWebGLAvailable } from './utils/webglDetection';
import './App.css';

// Lazy load the 3D Scene to improve initial load performance
const Scene = lazy(() => import('./components/3d/Scene'));

/**
 * Simple Error Boundary for the 3D Scene to catch rendering failures.
 */
class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Scene Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * The main Application component which manages the high-level game state and UI routing.
 */
function App() {
  const {
    gameState,
    matchConfig,
    updateMarker,
    startDelivery,
    playerSwing,
    addCommentary,
    toggleAimLock,
    initializeMatch
  } = useCricketGame();

  const [showSetup, setShowSetup] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('English');
  const [loadingCommentary, setLoadingCommentary] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  const handleStartMatch = (config) => {
    setApiKey(config.apiKey || '');
    setLanguage(config.language || 'English');

    // Initialize game with selected teams and overs
    if (initializeMatch) {
      initializeMatch(config);
      setShowSetup(false);
    }
  };

  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsSub, setShowSettingsSub] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState.matchStatus === 'COMPLETED') return;

      if (e.code === 'Enter') {
        if (gameState.phase === GAME_PHASES.AIMING) {
          toggleAimLock();
        }
      }

      // Allow Space to Bowl IF aim is locked
      if (e.code === 'Space') {
        if (gameState.phase === GAME_PHASES.AIMING && gameState.isAimLocked) {
          startDelivery();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.phase, gameState.isAimLocked, gameState.matchStatus, toggleAimLock, startDelivery]);


  const handleMarkerUpdate = (x, z) => {
    updateMarker(x, z);
  };

  const handleBowlClick = () => {
    startDelivery();
  };

  const handleSwing = () => {
    // AI Batsman - Skewed heavily towards boundaries
    const randomSkill = Math.random() * 1.5;
    const result = playerSwing(randomSkill);
    handleOutcome(result);
  };

  const handleMiss = () => {
    if (gameState.hasSwung) return; // Prevent double trigger if AI already swung
    const result = playerSwing(3.0);
    handleOutcome(result);
  };

  const handleOutcome = async (result) => {
    if (!result) return;

    const teamA = matchConfig.teamA?.name || "Team A";
    const teamB = matchConfig.teamB?.name || "Team B";
    const teamName = gameState.currentInnings === 'A' ? teamA : teamB;
    const opponentName = gameState.currentInnings === 'A' ? teamB : teamA;
    const situation = `Innings: ${gameState.currentInnings === 'A' ? '1st' : '2nd'}. Batting: ${teamName}. Bowling: ${opponentName}.`;
    const targetContext = gameState.target ? `Target: ${gameState.target + 1}. Needed: ${gameState.target + 1 - (gameState.teams?.B?.score || 0)}` : "";
    const fullContext = `${situation} ${targetContext}`;

    if (apiKey) {
      setLoadingCommentary(true);
      try {
        const commentary = await generateCommentary(apiKey, { ...result, context: fullContext }, language);
        addCommentary(`🎙️ Gemini: ${commentary}`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCommentary(false);
      }
    } else {
      addCommentary(`${result.bowler} bowls to ${result.batsman}. ${result.type}! ${result.runs} runs.`);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowSettingsSub(false); // Reset sub-menu when toggling main menu
  };

  const startNewMatch = () => {
    setShowSetup(true);
    setShowMenu(false);
    setShowSettingsSub(false);
  };

  const saveSettings = (key, lang) => {
    setApiKey(key);
    setLanguage(lang);
    setShowSettingsSub(false);
  };

  const getInteractionHint = () => {
    if (gameState.matchStatus === 'COMPLETED') return "Match Over! Refresh to Play Again.";
    if (gameState.phase === GAME_PHASES.AIMING) {
      if (gameState.scanner && gameState.scanner.includes("Break")) return gameState.scanner;
      if (gameState.isAimLocked) return "Target Locked! Press SPACE to Bowl";
      return "Aim with Mouse. Press ENTER to Lock.";
    }
    if (gameState.phase === GAME_PHASES.BOWLING) return "Bowling...";
    if (gameState.phase === GAME_PHASES.RUNNING) return "Running between wickets...";
    return "";
  };

  // Main Render - Wrap in setup check to avoid Hook order issues
  return (
    <div className="app-container-3d">
      {showSetup ? (
        <MatchSetup onStartMatch={handleStartMatch} />
      ) : (
        <>
          <div className="scene-wrapper">
            {webglSupported ? (
              <SceneErrorBoundary fallback={<div className="fallback-stadium">3D Scene Unavailable - Playing in 2D Mode</div>}>
                <Suspense fallback={<div className="fallback-stadium">Loading 3D Stadium...</div>}>
                  <Scene
                    gameState={gameState}
                    onMarkerUpdate={handleMarkerUpdate}
                    onSwing={handleSwing}
                    onMiss={handleMiss}
                  />
                </Suspense>
              </SceneErrorBoundary>
            ) : (
              <div className="fallback-stadium">3D Scene Unavailable - Playing in 2D Mode</div>
            )}
          </div>

          <div className="ui-overlay">
            <header className="broadcast-header">
              <div className="logo">🏏 CricketMania AI</div>
              <button className="settings-icon" onClick={toggleMenu} aria-label="Game Menu">
                ⚙️
              </button>
            </header>

            {showMenu && (
              <div className="modal-overlay">
                <div className="modal-content game-menu">
                  {!showSettingsSub ? (
                    <div className="menu-options">
                      <h2>Game Menu</h2>
                      <button className="menu-btn resume" onClick={() => setShowMenu(false)}>
                        ▶️ Resume Match
                      </button>
                      <button className="menu-btn new-game" onClick={startNewMatch}>
                        🔄 Start New Match
                      </button>
                      <button className="menu-btn ai-settings" onClick={() => setShowSettingsSub(true)}>
                        🤖 AI Commentary Settings
                      </button>
                    </div>
                  ) : (
                    <div className="settings-sub-menu">
                      <Settings onSave={saveSettings} />
                      <button className="back-btn" onClick={() => setShowSettingsSub(false)}>
                        ⬅️ Back to Menu
                      </button>
                    </div>
                  )}
                  <button className="close-btn" onClick={() => setShowMenu(false)}>Close</button>
                </div>
              </div>
            )}

            <main className="broadcast-layout">
              <section className="live-action">
                {/* Dynamic Hint Overlay */}
                {getInteractionHint() && (
                  <div className={`interaction-hint ${gameState.isAimLocked ? 'locked' : ''}`}>
                    {getInteractionHint()}
                  </div>
                )}

                {gameState.scanner !== "Ready" && (
                  <div className={`scanner-toast ${gameState.scanner === "OUT!" ? "wicket" : ""} ${gameState.phase === GAME_PHASES.RUNNING ? "running" : ""}`}>
                    {gameState.scanner}
                  </div>
                )}

                {/* Visual popups for boundaries */}
                {(gameState.scanner.includes("FOUR") || gameState.scanner.includes("SIX")) && (
                  <div className="boundary-popup">
                    {gameState.scanner}
                  </div>
                )}
              </section>

              <section className="broadcast-controls">
                {/* Show BOWL button only if Locked */}
                <Controls
                  onBowl={handleBowlClick}
                  disabled={!gameState.isAimLocked || gameState.phase !== GAME_PHASES.AIMING}
                  label={gameState.phase === GAME_PHASES.BOWLING ? "Bowling..." : "BOWL"}
                />
              </section>

              <section className="broadcast-footer">
                <div className="score-ticker">
                  <Scoreboard gameState={gameState} matchConfig={matchConfig} />
                </div>
                <div className="commentary-ticker">
                  <CommentaryFeed commentary={gameState.commentary} loading={loadingCommentary} />
                </div>
              </section>
            </main>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
