"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { CuboidCollider, InstancedRigidBodies, Physics, RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InstancedMesh } from "three";

// Extend the type if necessary
declare module "@react-three/rapier" {
  interface RapierRigidBody {
    applyImpulse(impulse: { x: number; y: number; z: number }, wakeUp?: boolean): void;
    applyTorqueImpulse(torque: { x: number; y: number; z: number }, wakeUp?: boolean): void;
  }
}

// Create a separate component for the scene
function Scene() {
  const cube = useRef<RapierRigidBody>(null);
  // const twister = useRef<RapierRigidBody>(null);
  const cubes = useRef<InstancedMesh>(null);

  const cubeJump = () => {
    if (cube.current) {
      const mass = cube.current.mass();
      cube.current.applyImpulse({ x: 0, y: 5 * mass, z: 0 }, true);
      cube.current.applyTorqueImpulse(
        { x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 },
        true
      );
    }
  };

  // useFrame((state) => {
  //   if (twister.current) {
  //     const time = state.clock.getElapsedTime();
  //     const eulerRotation = new THREE.Euler(0, time, 0);
  //     const quaternionRotation = new THREE.Quaternion();
  //     quaternionRotation.setFromEuler(eulerRotation);
  //     twister.current.setNextKinematicRotation(quaternionRotation);

  //     const angle = time*0.5 ;
  //     const x = Math.cos(angle) * 2;
  //     const z = Math.sin(angle) * 2;
  //     twister.current.setNextKinematicTranslation({ x: x, y: -0.8, z: z });
  //   }
  // });

  const collisionEnter = () => {
    // hitSound.currentTime = 0
    // hitSound.volume = Math.random()
    // hitSound.play()
  };

  const pencil = useGLTF('./pencil2.glb');

  const cubesCount = 20;

  const cubesTransforms = useMemo(() => {
    const instances: {
      key: string;
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    }[] = [];

    for (let i = 0; i < cubesCount; i++) {
      instances.push({
        key: `instance_${i}`,
        position: [
          (Math.random() - 0.5) * 8,
          6 + i * 0.2,
          (Math.random() - 0.5) * 8,
        ],
        rotation: [
          Math.random(),
          Math.random(),
          Math.random(),
        ],
        scale: [0.5,0.5,0.5],
      });
    }

    return instances;
  }, [cubesCount]);

  return (
    <>
      <OrbitControls makeDefault enableZoom={false} />
      <directionalLight castShadow position={[2, 4, 6]} intensity={1.5} />
      <ambientLight intensity={0.5} />

      <Physics gravity={[0, -9.08, 0]}>
        {/* Sphere */}
        <RigidBody
        ref={cube}
        position={[2, 2, 0]}
        gravityScale={1}
        restitution={0}
        friction={0.7}
        colliders={'ball'}
        onCollisionEnter={collisionEnter}
        >
          <CuboidCollider mass={0.5} args={[0.5, 0.5, 0.5]} />  
          <mesh castShadow position={[-1.5, 2, 0]} onClick={cubeJump}>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>

        {/* Cube */}
        <RigidBody
          ref={cube}
          position={[1.5, 2, 0]}
          gravityScale={1}
          restitution={0}
          friction={0.7}
          colliders={false}
          onCollisionEnter={collisionEnter}
        >
          <CuboidCollider mass={0.5} args={[0.5, 0.5, 0.5]} />
          <mesh castShadow onClick={cubeJump}>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
          </mesh>
        </RigidBody>

        {/* Ground Plane */}
        <RigidBody type="fixed" friction={0.7}>
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[100, 0.5, 100]} />
            <meshStandardMaterial color="greenyellow" />
          </mesh>
        </RigidBody>

        {/* <RigidBody
          ref={twister}
          position={[0, -0.8, 0]}
          friction={0}
          type="kinematicPosition"
        >
          <mesh castShadow scale={[0.4, 0.4, 3]}>
            <boxGeometry />
            <meshStandardMaterial color="red" />
          </mesh>
        </RigidBody> */}

        <RigidBody colliders={"hull"} position={[0, 4, 0]}>
          <primitive object={pencil.scene} />
        </RigidBody>

        

        {/* <RigidBody type="fixed">
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, 5.5]} />
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, -5.5]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[5.5, 1, 0]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[-5.5, 1, 0]} />
        </RigidBody> */}

        <InstancedRigidBodies instances={cubesTransforms}>
          <instancedMesh ref={cubes} castShadow args={[undefined, undefined, cubesCount]}>
            <boxGeometry />
            <meshStandardMaterial color="tomato" />
          </instancedMesh>
        </InstancedRigidBodies>

        <InstancedRigidBodies instances={cubesTransforms}>
          <instancedMesh ref={cubes} castShadow args={[undefined, undefined, cubesCount]}>
            <sphereGeometry />
            <meshStandardMaterial color="orchid" />
          </instancedMesh>
        </InstancedRigidBodies>

        <InstancedRigidBodies instances={cubesTransforms}>
      <group ref={cubes}>
        {cubesTransforms.map((transform, index) => (
          <RigidBody key={transform.key} colliders="hull" position={transform.position}>
            <primitive
              object={pencil.scene.clone()}
              position={transform.position}
              rotation={transform.rotation}
              scale={transform.scale}
            />
          </RigidBody>
        ))}
      </group>
    </InstancedRigidBodies>
      </Physics>
    </>
  );
}

export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-r from-neutral-50 to-lime-400">
      <Canvas shadows camera={{ position: [0, 5, 7], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}