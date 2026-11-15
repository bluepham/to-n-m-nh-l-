import * as THREE from 'three';
import { TankParameters } from '../types';
import { radiusAtHeight } from '../math/MathEngine';

export interface TankBuildOptions {
  crossSection: boolean;
  showShell: boolean;
  showAxis: boolean;
  showDimensions: boolean;
  radialSegments: number;
  heightSamples: number;
  isSoftwareGl: boolean;
}

export const TANK_BASE_Y = 1.15;

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => {
          const std = m as THREE.MeshStandardMaterial;
          if (std.map) std.map.dispose();
          m.dispose();
        });
      } else {
        const std = mesh.material as THREE.MeshStandardMaterial;
        if (std.map) std.map.dispose();
        mesh.material.dispose();
      }
    }
  });
}

function makeLabelSprite(text: string, bgHex = '#0f172a', fgHex = '#f8fafc'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgHex;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 56, 12);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = fgHex;
    ctx.font = '600 24px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 37);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.05, 0.3, 1);
  sprite.renderOrder = 12;
  return sprite;
}

/**
 * Builds the 3D water tank shell, support stand, inlet/outlet pipes, valves,
 * external level gauge, height ticks, and cross-section mathematical curve r(z).
 */
export function buildTankAssembly(
  parameters: TankParameters,
  options: TankBuildOptions,
): {
  group: THREE.Group;
  inletPipeCurve: THREE.CatmullRomCurve3;
  outletPipeCurve: THREE.CatmullRomCurve3;
  maxRadius: number;
} {
  const group = new THREE.Group();
  group.name = 'SmartWaterTankAssembly';

  const H = Math.max(0.2, parameters.H);
  const h = Math.min(Math.max(0, parameters.h), H);
  const samples = options.heightSamples;
  const radialSegs = options.radialSegments;
  const phiStart = 0;
  const phiLength = options.crossSection ? Math.PI * 1.25 : Math.PI * 2;

  const profilePoints: THREE.Vector2[] = [];
  let maxRadius = 0.25;
  for (let i = 0; i <= samples; i++) {
    const z = (i / samples) * H;
    const rVal = radiusAtHeight(z, parameters);
    const safeR = Number.isFinite(rVal) && rVal >= 0 ? rVal : 0.01;
    if (safeR > maxRadius) maxRadius = safeR;
    profilePoints.push(new THREE.Vector2(safeR, z));
  }

  const rBottom = Math.max(0.08, profilePoints[0].x);
  const rTop = Math.max(0.04, profilePoints[profilePoints.length - 1].x);
  const standRadius = Math.max(rBottom * 1.06, maxRadius * 0.72, 0.75);

  // 1. Structural Steel Support Stand (grounded at y = 0 up to TANK_BASE_Y)
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.78,
    roughness: 0.32,
  });
  const trimSteelMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.85,
    roughness: 0.22,
  });

  // Concrete pad & contact shadow grounding at y = 0
  const padRadius = Math.max(standRadius + 1.35, 2.2);
  const padGeo = new THREE.CylinderGeometry(padRadius, padRadius * 1.03, 0.08, 40);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.82,
    metalness: 0.08,
  });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.set(0, 0.04, 0);
  padMesh.receiveShadow = true;
  group.add(padMesh);

  // Top cradle ring beneath tank bottom
  const ringDeckGeo = new THREE.CylinderGeometry(
    Math.max(rBottom * 1.04, standRadius),
    Math.max(rBottom * 1.04, standRadius),
    0.09,
    40,
  );
  const ringDeck = new THREE.Mesh(ringDeckGeo, steelMat);
  ringDeck.position.set(0, TANK_BASE_Y - 0.045, 0);
  ringDeck.castShadow = !options.isSoftwareGl;
  ringDeck.receiveShadow = true;
  group.add(ringDeck);

  // 4 steel support columns + footplates + cross-bracing
  const legAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
  const legHeight = TANK_BASE_Y - 0.1;
  const legGeo = new THREE.CylinderGeometry(0.065, 0.075, legHeight, 14);
  const footGeo = new THREE.BoxGeometry(0.28, 0.05, 0.28);

  legAngles.forEach((ang, idx) => {
    const lx = Math.cos(ang) * (standRadius * 0.88);
    const lz = Math.sin(ang) * (standRadius * 0.88);
    const leg = new THREE.Mesh(legGeo, steelMat);
    leg.position.set(lx, 0.08 + legHeight * 0.5, lz);
    leg.castShadow = !options.isSoftwareGl;
    group.add(leg);

    const foot = new THREE.Mesh(footGeo, trimSteelMat);
    foot.position.set(lx, 0.095, lz);
    group.add(foot);

    // Horizontal tie beam to next column
    const nextAng = legAngles[(idx + 1) % 4];
    const nx = Math.cos(nextAng) * (standRadius * 0.88);
    const nz = Math.sin(nextAng) * (standRadius * 0.88);
    const midX = (lx + nx) * 0.5;
    const midZ = (lz + nz) * 0.5;
    const dist = Math.hypot(nx - lx, nz - lz);
    const beamGeo = new THREE.BoxGeometry(dist, 0.05, 0.05);
    const beam = new THREE.Mesh(beamGeo, trimSteelMat);
    beam.position.set(midX, TANK_BASE_Y * 0.52, midZ);
    beam.rotation.y = -Math.atan2(nz - lz, nx - lx);
    group.add(beam);
  });

  // 2. Tank Shell (Semi-transparent blue vessel)
  const tankGroup = new THREE.Group();
  tankGroup.position.set(0, TANK_BASE_Y, 0);
  group.add(tankGroup);

  if (options.showShell) {
    const latheGeo = new THREE.LatheGeometry(profilePoints, radialSegs, phiStart, phiLength);
    latheGeo.computeVertexNormals();

    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.12,
      roughness: 0.16,
      metalness: 0.08,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: options.crossSection ? 0.36 : 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const shellMesh = new THREE.Mesh(latheGeo, shellMat);
    shellMesh.renderOrder = 4;
    shellMesh.name = 'TankShell';
    tankGroup.add(shellMesh);

    // Subtle bottom floor disc of tank
    if (rBottom > 0.02) {
      const bottomGeo = new THREE.CircleGeometry(rBottom, radialSegs, phiStart, phiLength);
      bottomGeo.rotateX(-Math.PI / 2);
      const bottomMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        roughness: 0.4,
        metalness: 0.3,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
      bottomMesh.position.y = 0.004;
      tankGroup.add(bottomMesh);
    }

    // Metallic rim rings at bottom (z=0) and top (z=H)
    if (rBottom > 0.05) {
      const botRimGeo = new THREE.TorusGeometry(rBottom, 0.025, 12, radialSegs, phiLength);
      botRimGeo.rotateX(Math.PI / 2);
      const botRim = new THREE.Mesh(botRimGeo, trimSteelMat);
      tankGroup.add(botRim);
    }
    if (rTop > 0.05) {
      const topRimGeo = new THREE.TorusGeometry(rTop, 0.025, 12, radialSegs, phiLength);
      topRimGeo.rotateX(Math.PI / 2);
      const topRim = new THREE.Mesh(topRimGeo, trimSteelMat);
      topRim.position.y = H;
      tankGroup.add(topRim);
    }
  }

  // 3. Cross-Section Mode: Highlight Generating Curve r(z) and Radial Slices!
  if (options.crossSection) {
    // In Three.js LatheGeometry, phi=0 starts on +X in some versions or +Z (Three LatheGeometry: x = r * sin(phi), z = r * cos(phi) -> phi=0 is +Z, phi=pi/2 is +X)
    // Let's draw the exact generating curve at phi = 0 (x = 0, z_three = r(z)) AND at phi = phiLength!
    const curvePtsA: THREE.Vector3[] = [];
    const curvePtsB: THREE.Vector3[] = [];
    for (const pt of profilePoints) {
      curvePtsA.push(new THREE.Vector3(pt.x * Math.sin(phiStart), pt.y, pt.x * Math.cos(phiStart)));
      curvePtsB.push(
        new THREE.Vector3(
          pt.x * Math.sin(phiStart + phiLength),
          pt.y,
          pt.x * Math.cos(phiStart + phiLength),
        ),
      );
    }

    const genLineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b });
    const genLineA = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curvePtsA), genLineMat);
    const genLineB = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curvePtsB), genLineMat);
    tankGroup.add(genLineA, genLineB);

    // Draw horizontal radial spokes r(z_k) from Oz axis to generating curve
    const spokeMat = new THREE.LineDashedMaterial({
      color: 0xfbbf24,
      dashSize: 0.08,
      gapSize: 0.05,
    });
    const sliceCount = 5;
    for (let k = 1; k < sliceCount; k++) {
      const zk = (k / sliceCount) * H;
      const rk = radiusAtHeight(zk, parameters);
      if (Number.isFinite(rk) && rk > 0.04) {
        const sGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, zk, 0),
          new THREE.Vector3(rk * Math.sin(phiStart), zk, rk * Math.cos(phiStart)),
        ]);
        const sLine = new THREE.Line(sGeo, spokeMat);
        sLine.computeLineDistances();
        tankGroup.add(sLine);
      }
    }

    const rLabel = makeLabelSprite('Đường sinh r(z)', '#78350f', '#fef3c7');
    const midR = radiusAtHeight(H * 0.55, parameters) || maxRadius;
    rLabel.position.set(0.25, H * 0.55, midR + 0.55);
    tankGroup.add(rLabel);
  }

  // 4. Symmetry Axis Oz
  if (options.showAxis) {
    const axisTop = H + 0.85;
    const ozGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.4, 0),
      new THREE.Vector3(0, axisTop, 0),
    ]);
    const ozMat = new THREE.LineDashedMaterial({
      color: 0x0ea5e9,
      dashSize: 0.14,
      gapSize: 0.08,
    });
    const ozLine = new THREE.Line(ozGeo, ozMat);
    ozLine.computeLineDistances();
    tankGroup.add(ozLine);

    const coneGeo = new THREE.ConeGeometry(0.07, 0.2, 16);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const arrowCone = new THREE.Mesh(coneGeo, coneMat);
    arrowCone.position.set(0, axisTop, 0);
    tankGroup.add(arrowCone);

    const ozSprite = makeLabelSprite('Trục Oz (m)', '#0c4a6e', '#e0f2fe');
    ozSprite.position.set(0, axisTop + 0.28, 0);
    tankGroup.add(ozSprite);
  }

  // 5. External Sight-Glass Level Gauge & Dimension Ruler
  const gaugeX = maxRadius + 0.58;
  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.72,
    roughness: 0.28,
  });

  // Vertical transparent sight tube
  const sightTubeGeo = new THREE.CylinderGeometry(0.045, 0.045, H, 16);
  const sightTubeMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.42,
    roughness: 0.1,
    depthWrite: false,
  });
  const sightTube = new THREE.Mesh(sightTubeGeo, sightTubeMat);
  sightTube.position.set(gaugeX, H * 0.5, 0);
  sightTube.renderOrder = 5;
  tankGroup.add(sightTube);

  // Water column inside sight gauge
  if (h > 0.01) {
    const gaugeWaterGeo = new THREE.CylinderGeometry(0.03, 0.03, h, 14);
    const gaugeWaterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });
    const gaugeWater = new THREE.Mesh(gaugeWaterGeo, gaugeWaterMat);
    gaugeWater.position.set(gaugeX, h * 0.5, 0);
    tankGroup.add(gaugeWater);
  }

  // Gauge dial housing at top of sight glass
  const dialBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.07, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.35 }),
  );
  dialBody.rotation.x = Math.PI / 2;
  dialBody.position.set(gaugeX, H + 0.22, 0);
  tankGroup.add(dialBody);

  const dialFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 24),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  );
  dialFace.position.set(gaugeX, H + 0.22, 0.038);
  tankGroup.add(dialFace);

  // Needle rotated by fill ratio h / H
  const needleRatio = H > 0 ? h / H : 0;
  const needleGroup = new THREE.Group();
  needleGroup.position.set(gaugeX, H + 0.22, 0.042);
  needleGroup.rotation.z = THREE.MathUtils.lerp(Math.PI * 0.75, -Math.PI * 0.75, needleRatio);
  const needleBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.1, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 }),
  );
  needleBar.position.y = 0.04;
  needleGroup.add(needleBar);
  tankGroup.add(needleGroup);

  if (options.showDimensions) {
    const tickCount = Math.min(8, Math.max(2, Math.round(H * 2)));
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    for (let t = 0; t <= tickCount; t++) {
      const zTick = (t / tickCount) * H;
      const isMajor = t === 0 || t === tickCount || t === Math.floor(tickCount / 2);
      const tickMesh = new THREE.Mesh(
        new THREE.BoxGeometry(isMajor ? 0.18 : 0.1, 0.016, 0.016),
        tickMat,
      );
      tickMesh.position.set(gaugeX + 0.14, zTick, 0);
      tankGroup.add(tickMesh);
    }

    const topLabel = makeLabelSprite(`H = ${H.toFixed(2)} m`, '#0f172a', '#f8fafc');
    topLabel.position.set(gaugeX + 0.72, H, 0);
    tankGroup.add(topLabel);

    const botLabel = makeLabelSprite('z = 0 m', '#334155', '#f1f5f9');
    botLabel.position.set(gaugeX + 0.65, 0, 0);
    tankGroup.add(botLabel);

    if (h > 0.02) {
      const hLabel = makeLabelSprite(`h = ${h.toFixed(2)} m`, '#0891b2', '#ffffff');
      hLabel.position.set(gaugeX + 0.74, Math.min(H - 0.18, Math.max(0.18, h)), 0.22);
      tankGroup.add(hLabel);
    }
  }

  // 6. Inlet Pump + Pipe (Left side) & Drain Valve + Pipe (Right/Front side)
  const pumpX = -(maxRadius + 1.05);
  const pumpHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.42, 20),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.45, roughness: 0.35 }),
  );
  pumpHousing.rotation.z = Math.PI / 2;
  pumpHousing.position.set(pumpX, 0.3, 0);
  pumpHousing.castShadow = !options.isSoftwareGl;
  group.add(pumpHousing);

  const pumpBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.1, 0.38),
    steelMat,
  );
  pumpBase.position.set(pumpX, 0.12, 0);
  group.add(pumpBase);

  const inletPipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(pumpX, 0.45, 0),
    new THREE.Vector3(pumpX, TANK_BASE_Y + H + 0.38, 0),
    new THREE.Vector3(-Math.max(0.18, rTop * 0.55), TANK_BASE_Y + H + 0.38, 0),
    new THREE.Vector3(-Math.max(0.15, rTop * 0.45), TANK_BASE_Y + H - 0.04, 0),
  ]);
  const inletPipeGeo = new THREE.TubeGeometry(inletPipeCurve, 32, 0.055, 12, false);
  const inletPipeMesh = new THREE.Mesh(inletPipeGeo, pipeMat);
  inletPipeMesh.castShadow = !options.isSoftwareGl;
  group.add(inletPipeMesh);

  // Inlet Valve Wheel (Emerald green)
  const inValveMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.35,
    roughness: 0.4,
  });
  const inValveWheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 10, 20), inValveMat);
  inValveWheel.position.set(pumpX, 1.15, 0.12);
  group.add(inValveWheel);

  // Outlet Drain Pipe at tank bottom (Right-front angled so it doesn't collide with gauge)
  const drainZ = 0.55;
  const drainStartX = Math.max(0.15, rBottom * 0.72);
  const drainEndX = maxRadius + 1.05;
  const outletPipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(drainStartX, TANK_BASE_Y + 0.06, drainZ * 0.4),
    new THREE.Vector3(drainEndX * 0.72, TANK_BASE_Y + 0.06, drainZ),
    new THREE.Vector3(drainEndX, 0.42, drainZ),
    new THREE.Vector3(drainEndX + 0.3, 0.25, drainZ),
  ]);
  const outletPipeGeo = new THREE.TubeGeometry(outletPipeCurve, 24, 0.055, 12, false);
  const outletPipeMesh = new THREE.Mesh(outletPipeGeo, pipeMat);
  outletPipeMesh.castShadow = !options.isSoftwareGl;
  group.add(outletPipeMesh);

  // Drain Valve Wheel (Amber/Red)
  const outValveMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    metalness: 0.35,
    roughness: 0.4,
  });
  const outValveWheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 10, 20), outValveMat);
  outValveWheel.position.set(drainEndX * 0.75, TANK_BASE_Y + 0.2, drainZ);
  group.add(outValveWheel);

  return {
    group,
    inletPipeCurve,
    outletPipeCurve,
    maxRadius,
  };
}
