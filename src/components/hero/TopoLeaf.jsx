import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// --------------------------------------------------------
// 1. WEBGL SHADERS
// --------------------------------------------------------

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform sampler2D uMask;

  // Standard Simplex 2D Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i  = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 cUv = vUv * 2.0 - 1.0; 
    float distToMouse = distance(cUv, uMouse);
    
    float warpForce = smoothstep(0.7, 0.0, distToMouse);
    vec2 distortedUv = vUv + (cUv - uMouse) * warpForce * 0.25;

    // 1. GENERATE TREE RINGS
    // Lower the noise scale so "knots" in the wood are larger and smoother
    float n = snoise(distortedUv * 1.5 - vec2(uTime * 0.05));
    
    // Calculate distance from center to create the circular base of tree rings
    float distFromCenter = length(cUv);
    
    // Combine radial distance with noise. 
    // Increase '10.0' for more rings, increase '3.5' for more wobbly lines.
    float ringValue = (distFromCenter * 10.0) + (n * 3.5);
    
    float speed = 1.0 + (warpForce * 4.0);
    
    // Use a much lower multiplier (pi) instead of 60.0 to prevent zooming aliasing
    float contour = sin(ringValue * 3.1415 - (uTime * speed));
    
    // Widen the smoothstep gap (0.65 to 0.95) to act as anti-aliasing from a distance
    float lines = smoothstep(0.65, 0.95, contour);

    // 2. APPLY EXACT SHAPE MASK
    vec4 maskColor = texture2D(uMask, vUv);
    float alphaMask = maskColor.r;

    // 3. COLORS
    vec3 bgColor = vec3(0.02);
    vec3 baseLineColor = vec3(0.6); 
    vec3 activeLineColor = vec3(1.0);
    
    vec3 lineColor = mix(baseLineColor, activeLineColor, warpForce);
    vec3 finalColor = mix(bgColor, lineColor, lines);

    finalColor += mix(vec3(0.0), vec3(0.15), warpForce * alphaMask);

    gl_FragColor = vec4(finalColor, alphaMask);
  }
`;

// --------------------------------------------------------
// 2. REACT COMPONENT
// --------------------------------------------------------

const TopoLeaf = ({ maskUrl }) => {
  const materialRef = useRef();
  const meshRef = useRef();

  const leafTexture = useTexture(maskUrl);

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMask: { value: leafTexture },
  }), [leafTexture]);

  useFrame((state) => {
    // 1. Update Shader Uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Interpolate mouse for smooth liquid effect in the shader
      materialRef.current.uniforms.uMouse.value.lerp(state.pointer, 0.1);
    }

    // 2. 3D Parallax Tilt Effect
    if (meshRef.current) {
      // Tilts the physical leaf plane slightly towards the mouse pointer
      const targetRotationX = (state.pointer.y * Math.PI) / 8;
      const targetRotationY = (state.pointer.x * Math.PI) / 8;
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.05);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.5, 2.5]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

export default TopoLeaf;