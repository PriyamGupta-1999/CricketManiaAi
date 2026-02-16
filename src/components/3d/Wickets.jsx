import React from 'react';

const WicketSet = ({ position }) => {
    return (
        <group position={position}>
            {/* Stumps */}
            <mesh position={[-0.1, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.71, 8]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.71, 8]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.1, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.71, 8]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
        </group>
    );
};

const Wickets = () => {
    return (
        <>
            <WicketSet position={[0, 0, 11]} /> {/* Batting End */}
            <WicketSet position={[0, 0, -11]} /> {/* Bowling End */}
        </>
    );
};

export default Wickets;
