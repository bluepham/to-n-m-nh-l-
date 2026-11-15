import * as THREE from 'three';
import { TankParameters } from '../types';
import { radiusAtHeight } from '../math/MathEngine';
import { TANK_BASE_Y } from './TankGeometry';

export interface WaterBuildOptions {
  crossSection: boolean;
  radialSegments: number;
  heightSamples: number;
  enableWaves: boolean;
}

export interface WaterAssemblyHandle {
  group: THREE.Group;
  surfaceMesh: THREE.Mesh | null;
  baseSurfacePositions: Float32Array | null;
  inletFlowDots: THREE.Mesh[];
  outletFlowDots: THREE.Mesh[];
}

/**
 * Builds the interior water volume from z = 0 to z = h strictly conforming to r(z),
 * including the horizontal top water surface, cross-section cut faces, and pipe flow droplets.
 */
export function buildWaterAssembly(
  parameters: TankParameters,
  inletPipeCurve: THREE.CatmullRomCurve3,
  outletPipeCurve: THREE.CatmullRomCurve3,
  options: WaterBuildOptions,
): WaterAssemblyHandle {
  const group = new THREE.Group();
  group.name = 'SmartWaterVolume';

  const H = Math.max(0.2, parameters.H);
  const h = Math.min(Math.max(0, parameters.h), H);
  const phiStart = 0;
  const phiLength = options.crossSection ? Math.PI * 1.25 : Math.PI * 2;
  const wallInset = 0.016;

  let surfaceMesh: THREE.Mesh | null = null;
  let baseSurfacePositions: Float32Array | null = null;

  if (h > 0.004) {
    const waterGroup = new THREE.Group();
    waterGroup.position.set(0, TANK_BASE_Y, 0);
    group.add(waterGroup);

    const stepCount = Math.max(12, Math.round((h / H) * options.heightSamples));
    const waterPts: THREE.Vector2[] = [];

    const r0Raw = radiusAtHeight(0, parameters);
    const r0In = Math.max(0, (Number.isFinite(r0Raw) ? r0Raw : 0) - wallInset);
    waterPts.push(new THREE.Vector2(0, 0.006));

    for (let i = 0; i <= stepCount; i++) {
      const z = (i / stepCount) * h;
      const rRaw = radiusAtHeight(z, parameters);
      const rIn = Math.max(0.002, (Number.isFinite(rRaw) ? rRaw : 0) - wallInset);
      waterPts.push(new THREE.Vector2(rIn, Math.max(0.006, z)));
    }

    const rTopRaw = radiusAtHeight(h, parameters);
    const rTopIn = Math.max(0.002, (Number.isFinite(rTopRaw) ? rTopRaw : r0In) - wallInset);

    // Side & bottom water body
    const waterBodyGeo = new THREE.LatheGeometry(
      waterPts,
      options.radialSegments,
      phiStart,
      phiLength,
    );
    waterBodyGeo.computeVertexNormals();

    const waterBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.16,
      roughness: 0.12,
      metalness: 0.05,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    const waterBodyMesh = new THREE.Mesh(waterBodyGeo, waterBodyMat);
    waterBodyMesh.renderOrder = 2;
    waterGroup.add(waterBodyMesh);

    // Horizontal top water surface at z = h (subdivided rings if waves enabled)
    if (rTopIn > 0.005) {
      const surfGeo = options.enableWaves
        ? new THREE.RingGeometry(0.001, rTopIn, options.radialSegments, 8, phiStart, phiLength)
        : new THREE.CircleGeometry(rTopIn, options.radialSegments, phiStart, phiLength);

      surfGeo.rotateX(-Math.PI / 2);
      // Match LatheGeometry's phi orientation:
      // LatheGeometry maps phi -> (r*sin(phi), y, r*cos(phi)), whereas CircleGeometry after rotateX(-pi/2) maps theta -> (r*cos(theta), 0, -r*sin(theta)).
      // Rotating Y by -pi/2 and mirroring or aligning phi ensures exact alignment in cross-section!
      if (options.crossSection) {
        // Build exact polar fan matching LatheGeometry (x = r*sin(phi), z = r*cos(phi))
        surfGeo.dispose();
        const radialSteps = options.radialSegments;
        const ringSteps = options.enableWaves ? 6 : 1;
        const positions: number[] = [];
        const indices: number[] = [];
        for (let ir = 0; ir <= ringSteps; ir++) {
          const rr = (ir / ringSteps) * rTopIn;
          for (let ip = 0; ip <= radialSteps; ip++) {
            const phi = phiStart + (ip / radialSteps) * phiLength;
            positions.push(rr * Math.sin(phi), 0, rr * Math.cos(phi));
          }
        }
        const stride = radialSteps + 1;
        for (let ir = 0; ir < ringSteps; ir++) {
          for (let ip = 0; ip < radialSteps; ip++) {
            const a = ir * stride + ip;
            const b = (ir + 1) * stride + ip;
            const c = (ir + 1) * stride + (ip + 1);
            const d = ir * stride + (ip + 1);
            indices.push(a, b, d);
            indices.push(b, c, d);
          }
        }
        const customTopGeo = new THREE.BufferGeometry();
        customTopGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        customTopGeo.setIndex(indices);
        customTopGeo.computeVertexNormals();

        const topMat = new THREE.MeshPhysicalMaterial({
          color: 0x22d3ee,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.22,
          roughness: 0.08,
          metalness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide,
        });
        surfaceMesh = new THREE.Mesh(customTopGeo, topMat);
        surfaceMesh.position.y = h;
        surfaceMesh.renderOrder = 3;
        baseSurfacePositions = new Float32Array(positions);
        waterGroup.add(surfaceMesh);
      } else {
        const topMat = new THREE.MeshPhysicalMaterial({
          color: 0x22d3ee,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.22,
          roughness: 0.08,
          metalness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide,
        });
        surfaceMesh = new THREE.Mesh(surfGeo, topMat);
        surfaceMesh.position.y = h;
        surfaceMesh.renderOrder = 3;
        baseSurfacePositions = new Float32Array(
          (surfGeo.attributes.position as THREE.BufferAttribute).array,
        );
        waterGroup.add(surfaceMesh);
      }
    }

    // Cross-section vertical cut planes so water interior looks solid when sliced
    if (options.crossSection) {
      for (const angle of [phiStart, phiStart + phiLength]) {
        const cutPos: number[] = [];
        const cutIdx: number[] = [];
        for (let i = 1; i < waterPts.length; i++) {
          const p = waterPts[i];
          // Center vertex on Oz axis and outer vertex at r(z)
          cutPos.push(0, p.y, 0);
          cutPos.push(p.x * Math.sin(angle), p.y, p.x * Math.cos(angle));
        }
        const rows = waterPts.length - 1;
        for (let i = 0; i < rows - 1; i++) {
          const c0 = i * 2;
          const r0 = i * 2 + 1;
          const c1 = (i + 1) * 2;
          const r1 = (i + 1) * 2 + 1;
          cutIdx.push(c0, r0, c1);
          cutIdx.push(r0, r1, c1);
        }
        const cutGeo = new THREE.BufferGeometry();
        cutGeo.setAttribute('position', new THREE.Float32BufferAttribute(cutPos, 3));
        cutGeo.setIndex(cutIdx);
        cutGeo.computeVertexNormals();

        const cutMat = new THREE.MeshStandardMaterial({
          color: 0x0891b2,
          emissive: 0x0e7490,
          emissiveIntensity: 0.2,
          roughness: 0.25,
          transparent: true,
          opacity: 0.86,
          side: THREE.DoubleSide,
        });
        const cutMesh = new THREE.Mesh(cutGeo, cutMat);
        cutMesh.renderOrder = 2;
        waterGroup.add(cutMesh);
      }
    }
  }

  // Animated flow spheres along inlet & outlet pipes (visible when pumping/draining)
  const dotGeo = new THREE.SphereGeometry(0.068, 10, 10);
  const inDotMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const outDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  const inletFlowDots: THREE.Mesh[] = [];
  const outletFlowDots: THREE.Mesh[] = [];

  for (let i = 0; i < 6; i++) {
    const mIn = new THREE.Mesh(dotGeo, inDotMat);
    mIn.visible = false;
    inletPipeCurve.getPoint(i / 6, mIn.position);
    group.add(mIn);
    inletFlowDots.push(mIn);

    const mOut = new THREE.Mesh(dotGeo, outDotMat);
    mOut.visible = false;
    outletPipeCurve.getPoint(i / 6, mOut.position);
    group.add(mOut);
    outletFlowDots.push(mOut);
  }

  return {
    group,
    surfaceMesh,
    baseSurfacePositions,
    inletFlowDots,
    outletFlowDots,
  };
}

/**
 * Updates gentle surface ripples and pipe flow animations in place without allocations.
 */
export function updateWaterAnimation(
  handle: WaterAssemblyHandle,
  elapsedSec: number,
  inletPipeCurve: THREE.CatmullRomCurve3,
  outletPipeCurve: THREE.CatmullRomCurve3,
  isPumping: boolean,
  isDraining: boolean,
  enableWaves: boolean,
): void {
  const activeFlow = isPumping || isDraining;
  if (handle.surfaceMesh && handle.baseSurfacePositions && enableWaves) {
    const posAttr = handle.surfaceMesh.geometry.attributes.position as THREE.BufferAttribute;
    const base = handle.baseSurfacePositions;
    const amp = activeFlow ? 0.022 : 0.007;
    const speed = activeFlow ? 4.2 : 1.8;

    for (let i = 0; i < posAttr.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      const radialDist = Math.hypot(bx, bz);
      const wave =
        radialDist > 0.02
          ? Math.sin(radialDist * 5.5 - elapsedSec * speed) *
            Math.cos(bx * 2.5 + elapsedSec * 1.7) *
            amp
          : 0;
      posAttr.setXYZ(i, bx, by + wave, bz);
    }
    posAttr.needsUpdate = true;
  }

  // Inlet flow droplets
  handle.inletFlowDots.forEach((dot, idx) => {
    dot.visible = isPumping;
    if (isPumping) {
      const t = (elapsedSec * 0.75 + idx / handle.inletFlowDots.length) % 1;
      inletPipeCurve.getPoint(t, dot.position);
    }
  });

  // Outlet flow droplets
  handle.outletFlowDots.forEach((dot, idx) => {
    dot.visible = isDraining;
    if (isDraining) {
      const t = (elapsedSec * 0.85 + idx / handle.outletFlowDots.length) % 1;
      outletPipeCurve.getPoint(t, dot.position);
    }
  });
}
