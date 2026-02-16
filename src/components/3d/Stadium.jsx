import React from 'react';

const Stadium = () => {
    return (
        <group>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <circleGeometry args={[70, 64]} />
                <meshStandardMaterial color="#2e7d32" />
            </mesh>

            {/* Boundary Rope */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <ringGeometry args={[68, 69, 64]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Simple Stands */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
                <ringGeometry args={[70, 90, 64]} />
                <meshStandardMaterial color="#546e7a" side={2} />
            </mesh>
        </group>
    );
};

export default Stadium;
