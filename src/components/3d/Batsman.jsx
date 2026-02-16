import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GAME_PHASES } from '../../hooks/useCricketGame';
import * as THREE from 'three';

const Batsman = ({ phase, ballPosition, onSwing }) => {
    // Model References
    const groupRef = useRef();
    const torsoRef = useRef();
    const headRef = useRef();
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const leftLegRef = useRef();
    const rightLegRef = useRef();
    const batGroupRef = useRef(); // Pivot point for bat

    const [isSwinging, setIsSwinging] = useState(false);
    const [hasSwungForBall, setHasSwungForBall] = useState(false);

    // Animation constants
    const runDirection = useRef(-1);
    const runCycle = useRef(0);
    const breathingCycle = useRef(0);

    // Reset swing state when phase changes
    useEffect(() => {
        if (phase === GAME_PHASES.AIMING) {
            setHasSwungForBall(false);
            setIsSwinging(false);

            // Reset position & pose
            if (groupRef.current) {
                groupRef.current.position.set(0, 0, 11);
                runDirection.current = -1;

                // Reset rotations
                if (torsoRef.current) torsoRef.current.rotation.set(0, 0, 0);
                if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
                if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
                if (batGroupRef.current) batGroupRef.current.rotation.set(0, 0, 0);
            }
        }
    }, [phase]);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // --- AI Logic ---
        if (phase === GAME_PHASES.BOWLING && !hasSwungForBall && ballPosition) {
            if (ballPosition.z > 8) {
                triggerSwing();
            }
        }

        // --- Animations ---

        // 1. Idle / Stance Animation
        if (phase === GAME_PHASES.AIMING || phase === GAME_PHASES.BOWLING) {
            breathingCycle.current += delta * 2;
            const breath = Math.sin(breathingCycle.current) * 0.05;

            // Gentle bobbing
            if (torsoRef.current) torsoRef.current.position.y = 0.9 + breath * 0.5;

            // Bat tapping
            if (batGroupRef.current && !isSwinging) {
                batGroupRef.current.rotation.x = Math.sin(time * 10) * 0.1; // Tap tap
            }
        }

        // 2. Swing Animation
        if (isSwinging && batGroupRef.current) {
            // Lerp to swing position
            batGroupRef.current.rotation.x = THREE.MathUtils.lerp(batGroupRef.current.rotation.x, -Math.PI / 1.5, 0.2);
            batGroupRef.current.rotation.y = THREE.MathUtils.lerp(batGroupRef.current.rotation.y, Math.PI / 2, 0.2);

            // Body rotation
            if (torsoRef.current) torsoRef.current.rotation.y = THREE.MathUtils.lerp(torsoRef.current.rotation.y, -Math.PI / 4, 0.1);
        }

        // 3. Running Animation
        if (phase === GAME_PHASES.RUNNING && groupRef.current) {
            const speed = 15;
            const moveStep = speed * delta;

            // Move Character
            groupRef.current.position.z += moveStep * runDirection.current;

            // Turn around logic
            if (groupRef.current.position.z < -9) {
                runDirection.current = 1;
                groupRef.current.rotation.y = Math.PI; // Face back
            } else if (groupRef.current.position.z > 11) {
                runDirection.current = -1;
                groupRef.current.rotation.y = 0; // Face forward
            }

            // Leg & Arm Cycle
            runCycle.current += delta * 15;
            const legRot = Math.sin(runCycle.current) * 0.5;

            if (leftLegRef.current) leftLegRef.current.rotation.x = legRot;
            if (rightLegRef.current) rightLegRef.current.rotation.x = -legRot;

            if (leftArmRef.current) leftArmRef.current.rotation.x = -legRot;
            if (rightArmRef.current) rightArmRef.current.rotation.x = legRot;
        }
    });

    const triggerSwing = () => {
        setIsSwinging(true);
        setHasSwungForBall(true);
        onSwing();

        setTimeout(() => setIsSwinging(false), 800);
    };

    // Color Palette
    const skinColor = "#f5cca0";
    const jerseyColor = "#1976d2"; // India Blue or adaptable
    const padColor = "#ffffff";
    const helmetColor = "#0d47a1";

    return (
        <group position={[0, 0, 11]} ref={groupRef}>

            {/* --- TORSO GROUP --- */}
            <group position={[0, 0.9, 0]} ref={torsoRef}>
                {/* Upper Body (Jersey) */}
                <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.5, 0.6, 0.25]} />
                    <meshStandardMaterial color={jerseyColor} />
                </mesh>

                {/* Head Group (Parented to Torso so it bobs) */}
                <group position={[0, 0.85, 0]} ref={headRef}>
                    {/* Face */}
                    <mesh castShadow>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color={skinColor} />
                    </mesh>
                    {/* Helmet */}
                    <mesh position={[0, 0.05, 0]} castShadow>
                        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
                        <meshStandardMaterial color={helmetColor} roughnes={0.3} metalness={0.5} />
                    </mesh>
                    {/* Grille */}
                    <mesh position={[0, -0.05, 0.18]} rotation={[0, 0, 0]}>
                        <torusGeometry args={[0.08, 0.01, 8, 16]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>

                {/* --- ARMS --- */}
                {/* Left Arm */}
                <group position={[-0.32, 0.6, 0]} ref={leftArmRef}>
                    <mesh position={[0, -0.25, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.5, 0.12]} />
                        <meshStandardMaterial color={jerseyColor} />
                    </mesh>
                    {/* Glove */}
                    <mesh position={[0, -0.55, 0]}>
                        <boxGeometry args={[0.14, 0.14, 0.14]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>

                {/* Right Arm */}
                <group position={[0.32, 0.6, 0]} ref={rightArmRef}>
                    <mesh position={[0, -0.25, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.5, 0.12]} />
                        <meshStandardMaterial color={jerseyColor} />
                    </mesh>
                    {/* Glove */}
                    <mesh position={[0, -0.55, 0]}>
                        <boxGeometry args={[0.14, 0.14, 0.14]} />
                        <meshStandardMaterial color="white" />
                    </mesh>

                    {/* --- BAT Attached to Right Hand for simplicity (or both) --- */}
                    {/* In a real rig, hands hold bat. Here we parent bat to right arm/hand or torso pivot */}
                    <group position={[0, -0.55, 0.1]} ref={batGroupRef} rotation={[0, 0, -Math.PI / 6]}>
                        {/* Handle */}
                        <mesh position={[0, 0.3, 0]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.3]} />
                            <meshStandardMaterial color="black" />
                        </mesh>
                        {/* Blade */}
                        <mesh position={[0, -0.3, 0]}>
                            <boxGeometry args={[0.15, 0.8, 0.04]} />
                            <meshStandardMaterial color="#d7ccc8" />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* --- LEGS --- */}
            <group position={[0, 0, 0]}>
                {/* Left Leg */}
                <group position={[-0.15, 0.9, 0]} ref={leftLegRef}>
                    {/* Thigh/Pants */}
                    <mesh position={[0, -0.45, 0]}>
                        <cylinderGeometry args={[0.11, 0.1, 0.9]} />
                        <meshStandardMaterial color={jerseyColor} />
                    </mesh>
                    {/* Pad */}
                    <mesh position={[0, -0.6, 0.08]}>
                        <boxGeometry args={[0.16, 0.5, 0.08]} />
                        <meshStandardMaterial color={padColor} />
                    </mesh>
                </group>

                {/* Right Leg */}
                <group position={[0.15, 0.9, 0]} ref={rightLegRef}>
                    {/* Thigh/Pants */}
                    <mesh position={[0, -0.45, 0]}>
                        <cylinderGeometry args={[0.11, 0.1, 0.9]} />
                        <meshStandardMaterial color={jerseyColor} />
                    </mesh>
                    {/* Pad */}
                    <mesh position={[0, -0.6, 0.08]}>
                        <boxGeometry args={[0.16, 0.5, 0.08]} />
                        <meshStandardMaterial color={padColor} />
                    </mesh>
                </group>
            </group>

        </group>
    );
};

export default Batsman;
