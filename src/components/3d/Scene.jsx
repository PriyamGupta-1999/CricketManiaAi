import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import Stadium from './Stadium';
import Pitch from './Pitch';
import Wickets from './Wickets';
import Ball from './Ball';
import Batsman from './Batsman';
import { GAME_PHASES } from '../../hooks/useCricketGame';

const Scene = ({ gameState, onMarkerUpdate, onSwing, onMiss }) => {
    const [ballState, setBallState] = useState(null); // To pass pos from Ball to Batsman

    return (
        <div className="canvas-container">
            <Canvas
                shadows
                camera={{ position: [0, 5, -18], fov: 50 }}
                gl={{
                    antialias: false,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: true
                }}
                onCreated={({ gl }) => {
                    console.log("WebGL Context Created:", gl.getContext());
                }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <Sky sunPosition={[100, 20, 100]} />
                <Environment preset="park" />

                <Suspense fallback={null}>
                    <Stadium />
                    <Pitch
                        markerPos={gameState.markerPos}
                        phase={gameState.phase}
                        onMarkerUpdate={onMarkerUpdate}
                    />
                    <Wickets />

                    <Batsman
                        phase={gameState.phase}
                        ballPosition={ballState} // Pass real-time ball pos
                        onSwing={onSwing}
                    />

                    <Ball
                        phase={gameState.phase}
                        markerPos={gameState.markerPos}
                        onPositionUpdate={setBallState} // Receive pos from ball
                        onHitBat={() => { }}
                        onMiss={onMiss}
                    />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.1}
                    minDistance={5}
                    maxDistance={50}
                    enabled={gameState.phase === GAME_PHASES.AIMING || gameState.phase === GAME_PHASES.IDLE}
                />
            </Canvas>
        </div>
    );
};

export default Scene;
