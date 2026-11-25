import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';

export interface ModelViewerProps {
  src: string;
  animated?: boolean;
  scale?: number;
  autoRotate?: boolean;
  rotateSpeed?: number;
  [key: string]: unknown;
}

export default function ModelViewer({
  src,
  animated = false,
  scale = 1,
  autoRotate = false,
  rotateSpeed = 0.35,
  ...rest
}: ModelViewerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [useFallbackSpin, setUseFallbackSpin] = useState(false);
  const { scene, animations } = useGLTF(src);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!animated) {
      setUseFallbackSpin(false);
      return;
    }

    if (!animations?.length) {
      setUseFallbackSpin(true);
      return;
    }

    const clips = Object.values(actions).filter(Boolean) as THREE.AnimationAction[];
    if (!clips.length) {
      setUseFallbackSpin(true);
      return;
    }

    setUseFallbackSpin(false);
    clips.forEach((clip) => {
      clip.reset().fadeIn(0.2).setLoop(THREE.LoopRepeat, Infinity).play();
    });

    return () => {
      clips.forEach((clip) => clip.fadeOut(0.2));
    };
  }, [animated, animations, actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (autoRotate) {
      groupRef.current.rotation.y += delta * rotateSpeed;
      return;
    }
    if (useFallbackSpin) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  // Clear useGLTF cache on unmount so the next mount gets a fresh load.
  // Reusing a cached scene whose textures were created in a disposed WebGL
  // context can cause "glTexStorage2D/3D: Texture is immutable" when the
  // new context tries to re-allocate.
  useEffect(() => {
    return () => {
      useGLTF.clear(src);
    };
  }, [src]);

  return (
    <group ref={groupRef} {...rest}>
      <primitive object={scene} scale={scale} />
    </group>
  );
}
