import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

// 1. Import the image directly so React handles the path
import leafMaskPath from './leaf-mask.png'; 

p5.disableFriendlyErrors = true;

export default function TopoLeaf() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p) => {
      let leafMask;
      let pg;
      let smoothMouse = { x: 0.5, y: 0.5 };
      const res = 120; 
      let imageLoaded = false;
      let imageError = false; // Track errors

      const smoothStep = (edge0, edge1, x) => {
        let t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3.0 - 2.0 * t);
      };

      p.preload = () => {
        // 2. Use the imported path variable here
        leafMask = p.loadImage(
          leafMaskPath, 
          // Success callback
          () => {
            imageLoaded = true;
          },
          // Error callback
          (err) => {
            console.error("Failed to load image:", err);
            imageError = true;
          }
        );
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.pixelDensity(1);
        pg = p.createGraphics(res, res);
      };

      p.draw = () => {
        p.background(15);

        // Show error if image failed to load
        if (imageError) {
          p.fill(255, 100, 100);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("Error finding leaf-mask.png. Check the console.", p.width / 2, p.height / 2);
          return;
        }

        // Keep loading screen until image finishes
        if (!imageLoaded) {
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("Loading mask...", p.width / 2, p.height / 2);
          return;
        }

        if (leafMask.width !== res) {
          leafMask.resize(res, res);
          leafMask.loadPixels();
        }

        let targetMouseX = p.mouseX / p.width;
        let targetMouseY = p.mouseY / p.height;
        
        if (p.mouseX === 0 && p.mouseY === 0) {
          targetMouseX = 0.5;
          targetMouseY = 0.5;
        }
        
        smoothMouse.x = p.lerp(smoothMouse.x, targetMouseX, 0.1);
        smoothMouse.y = p.lerp(smoothMouse.y, targetMouseY, 0.1);

        pg.loadPixels();
        let time = p.millis() / 1000.0;
        let mouseUvX = smoothMouse.x * 2.0 - 1.0;
        let mouseUvY = smoothMouse.y * 2.0 - 1.0;

        for (let y = 0; y < res; y++) {
          for (let x = 0; x < res; x++) {
            let u = x / res;
            let v = y / res;
            
            let cUvX = u * 2.0 - 1.0;
            let cUvY = v * 2.0 - 1.0;
            
            let distToMouse = p.dist(cUvX, cUvY, mouseUvX, mouseUvY);
            let warpForce = smoothStep(0.7, 0.0, distToMouse);
            let distortedU = u + (cUvX - mouseUvX) * warpForce * 0.25;
            let distortedV = v + (cUvY - mouseUvY) * warpForce * 0.25;

            let n = p.noise(distortedU * 5.0 + time * 0.15, distortedV * 5.0 + time * 0.15);
            let speed = 3.0 + (warpForce * 8.0);
            let contour = p.sin(n * 25.0 - (time * speed));
            let lines = smoothStep(0.85, 0.95, contour);

            let maskIdx = (x + y * res) * 4;
            let alphaMask = leafMask.pixels[maskIdx] / 255.0;

            let baseLineColor = 0.6;
            let activeLineColor = 1.0;
            let lineColor = p.lerp(baseLineColor, activeLineColor, warpForce);
            let finalVal = p.lerp(0.02, lineColor, lines);

            finalVal += warpForce * 0.15 * alphaMask;
            finalVal = p.constrain(finalVal, 0.0, 1.0);

            let c = finalVal * 255;
            let idx = (x + y * res) * 4;
            
            pg.pixels[idx]     = c; 
            pg.pixels[idx + 1] = c; 
            pg.pixels[idx + 2] = c; 
            pg.pixels[idx + 3] = alphaMask * 255; 
          }
        }
        pg.updatePixels();

        p.push();
        p.translate(p.width / 2, p.height / 2);
        
        let normX = smoothMouse.x - 0.5;
        let normY = smoothMouse.y - 0.5;
        
        p.shearX(normX * 0.3);
        p.shearY(-normY * 0.3);
        p.rotate(normX * 0.2);

        let planeSize = Math.min(p.width, p.height) * 0.6;
        p.imageMode(p.CENTER);
        p.image(pg, 0, 0, planeSize, planeSize);
        p.pop();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#050505' }} 
    />
  );
}