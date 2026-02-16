import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import Stadium from './Stadium';
import Pitch from './Pitch';
import Wickets from './Wickets';

const Scene = () => {
    return (
        <div className="canvas-container">
            <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
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
                    <Pitch />
                    <Wickets />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.1}
                    minDistance={5}
                    maxDistance={50}
                />
            </Canvas>
        </div>
    );
};

export default Scene;
