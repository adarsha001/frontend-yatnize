import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import TopoLeaf from './TopoLeaf';

const toCssSize = (value) =>
  typeof value === 'number' ? `${value}px` : value;

export default function Logo({
  width = 44,
  height = 44,
  maskUrl = '/image_1.png',
  interactive = false,
  withEnvironment = false,
  className = '',
  style = {},
  canvasStyle = {},
  ...rest
}) {
  const canvasPointerEvents = interactive ? 'auto' : 'none';

  return (
    <div
      className={className}
      style={{
        width: toCssSize(width),
        height: toCssSize(height),
        flexShrink: 0,
        display: 'inline-block',
        lineHeight: 0,
        ...style,
      }}
      {...rest}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: canvasPointerEvents,
          ...canvasStyle,
        }}
      >
        <Suspense fallback={null}>
          <TopoLeaf maskUrl={maskUrl} />

          {interactive && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minAzimuthAngle={-Math.PI / 6}
              maxAzimuthAngle={Math.PI / 6}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 1.5}
            />
          )}

          {withEnvironment && <Environment preset="city" />}
        </Suspense>
      </Canvas>
    </div>
  );
}