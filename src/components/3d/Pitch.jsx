import React from 'react';

const Pitch = () => {
    return (
        <group>
            {/* The Pitch Strip (approx 20m x 3m in game units) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
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
        </group>
    );
};

export default Pitch;
