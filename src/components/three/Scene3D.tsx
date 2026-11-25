import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';

function ContextLostHandler() {
  const { gl, set } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const glAny = gl as unknown as {
      forceContextLoss?: () => void;
      getContext?: () => { isContextLost?: () => boolean };
      extensions?: { get?: (n: string) => { loseContext?: () => void } };
    };

    // Prevent forceContextLoss from calling loseContext when the context is
    // already lost. R3F/Three may call forceContextLoss on unmount; if the
    // context was already lost (browser/GPU), that triggers "INVALID_OPERATION:
    // loseContext: context already lost" from the browser. No-op when already lost.
    const origForce = glAny.forceContextLoss;
    if (typeof origForce === 'function') {
      glAny.forceContextLoss = () => {
        const ctx = glAny.getContext?.();
        if (ctx?.isContextLost?.()) return;
        origForce.call(gl);
      };
    }

    // Fallback: wrap loseContext in try-catch in case it's called directly.
    const ext = glAny.extensions?.get?.('WEBGL_lose_context');
    if (ext?.loseContext) {
      const orig = ext.loseContext.bind(ext);
      ext.loseContext = () => {
        try { orig(); } catch { /* ignore */ }
      };
    }

    const onContextLost = (e: Event) => {
      e.preventDefault();
      set({ frameloop: 'never' });
    };

    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      canvas.removeEventListener('webglcontextlost', onContextLost);
      // Do NOT call gl.dispose() here: R3F's Canvas already disposes the
      // renderer on unmount. Double-dispose can leave textures in a bad
      // state and contribute to "Texture is immutable" errors.
    };
  }, [gl, set]);

  return null;
}

export interface Scene3DProps {
  className?: string;
  children: ReactNode;
}

export default function Scene3D({ className, children }: Scene3DProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ContextLostHandler />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      {children}
    </Canvas>
  );
}
