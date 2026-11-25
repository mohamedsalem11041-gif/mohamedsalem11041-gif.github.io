# Three.js / @react-three/fiber with GSAP

## Scroll-controlled progress (React)
```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Scene() {
  const mesh = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#scene',
        start: 'top top',
        end: '+=200%',
        scrub: true,
        onUpdate: self => {
          progress.current = self.progress;
        },
      });
    });
    return () => ctx.revert();
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    const t = progress.current;
    mesh.current.rotation.y = gsap.utils.interpolate(0, Math.PI * 2, t);
    mesh.current.position.z = gsap.utils.interpolate(0.5, -2, t);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial roughness={0.25} metalness={0.1} />
    </mesh>
  );
}

export function SceneCanvas() {
  return (
    <div id="scene" style={{ height: '200vh' }}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 2]} intensity={1.2} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

## Camera timeline
```ts
const ctx = gsap.context(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scene',
      start: 'top top',
      end: '+=300%',
      scrub: true,
      pin: true,
    },
  });

  tl.to(camera.position, { x: 1.8, z: 5, ease: 'power2.inOut' }, 0)
    .to(camera.position, { x: -1, y: 0.6, z: 3 }, 0.5)
    .to(controls.target, { x: 0, y: 0, z: 0, ease: 'power1.inOut' }, 0);
});
```

## Performance guardrails
- Keep draw calls low: merge geometry, use `drei` helpers (`Instances`, `AccumulativeShadows` carefully).
- Use `dpr={[1,1.5]}` and `performance` props or `<AdaptiveDpr />` to stay within GPU budget.
- Prefer HDR/EXR env maps over multiple lights; avoid dynamic shadows unless needed.
- Pause heavy animations when section off-screen: use ScrollTrigger callbacks to `invalidate` or `disable`.
- Optimize models: DRACO/KTX2 compression, reduce polygon count, bake lighting when possible.
