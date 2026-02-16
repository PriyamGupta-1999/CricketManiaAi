import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ball = ({ phase, markerPos, onHitBat, onMiss, onPositionUpdate }) => {
    const ballRef = useRef();
    const [active, setActive] = useState(false);
    const startPos = new THREE.Vector3(0, 2, -10);

    useEffect(() => {
        if (phase === 'BOWLING') {
            setActive(true);
            ballRef.current.position.copy(startPos);
        } else if (phase === 'AIMING') {
            setActive(false);
            if (ballRef.current) ballRef.current.position.set(0, -10, 0);
        }
    }, [phase]);

    useFrame((state, delta) => {
        if (!active || !ballRef.current) return;

        if (phase === 'BOWLING') {
            const speed = 15;
            ballRef.current.position.z += speed * delta;

            // Report position to parent (for AI batsman)
            if (onPositionUpdate) {
                onPositionUpdate(ballRef.current.position.clone());
            }

            if (ballRef.current.position.z > 12) {
                onMiss();
                setActive(false);
            }
        }
    });

    return (
        <mesh ref={ballRef} position={[0, -10, 0]} castShadow>
            <sphereGeometry args={[0.07, 32, 32]} />
            <meshStandardMaterial color="white" />
        </mesh>
    );
};

export default Ball;
