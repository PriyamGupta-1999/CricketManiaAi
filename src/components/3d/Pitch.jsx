import React, { useRef } from 'react';
import { useThree } from '@react-three/fiber';
// import { GAME_PHASES } from '../../hooks/useCricketGame'; // Optional if needed directly

const Pitch = ({ markerPos, phase, onMarkerUpdate }) => {
    // We can infer isLocked from parent if we passed it, or just rely on 'phase' and update behavior.
    // Actually, Pitch receives updated markerPos. If parent stops updating it, it stays still!
    // So no logic change needed here for "freezing", but visually we might want to change color?
    // Let's passed 'isLocked' prop if we want visual feedback (e.g. Green when locked).

    // Update: App.jsx passes entire gameState to Scene, causing scene to re-render. 
    // We need to pass isAimLocked to Pitch.

    // NOTE: In Scene.jsx we must pass isAimLocked.

    // For now, let's just stick to the markerPos logic. 
    // If parent stops calling setMarkerPos, the marker will freeze.

    const handlePointerMove = (e) => {
        if (phase === 'AIMING') {
            onMarkerUpdate(
                Math.max(-1, Math.min(1, e.point.x)),
                Math.max(-8, Math.min(8, e.point.z))
            );
        }
    };

    return (
        <group>
            {/* The Pitch Strip */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.01, 0]}
                receiveShadow
                onPointerMove={handlePointerMove}
            >
                <planeGeometry args={[3, 22]} />
                <meshStandardMaterial color="#eecfa1" />
            </mesh>

            {/* Crease Markings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 10]}>
                <planeGeometry args={[2.5, 0.1]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -10]}>
                <planeGeometry args={[2.5, 0.1]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Aiming Marker */}
            {phase === 'AIMING' && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[markerPos.x, 0.05, markerPos.z]}>
                    <ringGeometry args={[0.3, 0.4, 32]} />
                    {/* We don't have isLocked prop here easily without changing Scene,
                   so let's keep it Red. The UI hint "Locked" handles the feedback. */}
                    <meshBasicMaterial color="#ff5252" opacity={0.8} transparent side={2} />
                </mesh>
            )}
        </group>
    );
};

export default Pitch;
