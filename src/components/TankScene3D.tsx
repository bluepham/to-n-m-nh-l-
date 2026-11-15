import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {
  Box,
  Download,
  Eye,
  Grid,
  Layers,
  Maximize2,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Sun,
  Waves,
} from 'lucide-react';
import { TankParameters } from '../types';
import {
  TANK_BASE_Y,
  buildTankAssembly,
  disposeObject3D,
} from './TankGeometry';
import {
  WaterAssemblyHandle,
  buildWaterAssembly,
  updateWaterAnimation,
} from './WaterGeometry';

export type SceneEnvironmentMode = 'lab' | 'outdoor';
export type CameraPreset = 'iso' | 'front' | 'side' | 'top';

interface TankScene3DProps {
  parameters: TankParameters;
  isPumping?: boolean;
  isDraining?: boolean;
  compact?: boolean;
  heightClass?: string;
  initialCrossSection?: boolean;
  titleBadge?: string;
}

let cachedSoftwareGl: boolean | null = null;

function detectSoftwareWebGL(): boolean {
  if (cachedSoftwareGl !== null) return cachedSoftwareGl;
  if (typeof document === 'undefined') return true;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedSoftwareGl;
  } catch {
    cachedSoftwareGl = true;
    return true;
  }
}

function buildOutdoorBackdrop(): THREE.Group {
  const envGroup = new THREE.Group();
  envGroup.name = 'OutdoorCampusBackdrop';

  // Grass courtyard ring beyond concrete pad
  const lawnGeo = new THREE.CircleGeometry(36, 48);
  lawnGeo.rotateX(-Math.PI / 2);
  const lawnMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    roughness: 0.92,
    metalness: 0.02,
  });
  const lawn = new THREE.Mesh(lawnGeo, lawnMat);
  lawn.position.y = -0.01;
  lawn.receiveShadow = true;
  envGroup.add(lawn);

  // Asphalt access walkway
  const roadGeo = new THREE.PlaneGeometry(5.5, 28);
  roadGeo.rotateX(-Math.PI / 2);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.85,
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.position.set(0, 0.005, -10);
  envGroup.add(road);

  // Distant School Building (Trường THPT Nguyễn Huệ architectural silhouette)
  const schoolGroup = new THREE.Group();
  schoolGroup.position.set(-7, 0, -16);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.78 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.65 });
  const winMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.25,
    metalness: 0.4,
  });

  const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(11, 4.4, 3.2), wallMat);
  mainBlock.position.y = 2.2;
  schoolGroup.add(mainBlock);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 1.4, 4), roofMat);
  roof.position.y = 5.1;
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.25, 1, 0.45);
  schoolGroup.add(roof);

  for (let row = 0; row < 2; row++) {
    for (let col = -4; col <= 4; col += 2) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.08), winMat);
      win.position.set(col, 1.3 + row * 1.7, 1.62);
      schoolGroup.add(win);
    }
  }
  envGroup.add(schoolGroup);

  // Distant Municipal Water Station Tower on right horizon
  const towerGroup = new THREE.Group();
  towerGroup.position.set(9.5, 0, -15);
  const towerSteel = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.6,
    roughness: 0.4,
  });
  const towerHead = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.35,
    roughness: 0.35,
  });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 6.2, 16), towerSteel);
  stem.position.y = 3.1;
  towerGroup.add(stem);
  const tankTop = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.4, 2.4, 24), towerHead);
  tankTop.position.y = 7.1;
  towerGroup.add(tankTop);
  envGroup.add(towerGroup);

  // Stylized campus trees
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.88 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
  const treeCoords: [number, number][] = [
    [-11, -7],
    [-9, 6],
    [10, -6],
    [11, 5],
  ];
  treeCoords.forEach(([tx, tz], i) => {
    const tGroup = new THREE.Group();
    const s = 0.85 + (i % 3) * 0.15;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.6, 10), trunkMat);
    trunk.position.y = 0.8;
    const crown1 = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.2, 12), leafMat);
    crown1.position.y = 2.3;
    const crown2 = new THREE.Mesh(new THREE.ConeGeometry(0.88, 1.8, 12), leafMat);
    crown2.position.y = 3.4;
    tGroup.add(trunk, crown1, crown2);
    tGroup.position.set(tx, 0, tz);
    tGroup.scale.setScalar(s);
    envGroup.add(tGroup);
  });

  return envGroup;
}

export const TankScene3D: React.FC<TankScene3DProps> = ({
  parameters,
  isPumping = false,
  isDraining = false,
  compact = false,
  heightClass,
  initialCrossSection = false,
  titleBadge,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [envMode, setEnvMode] = useState<SceneEnvironmentMode>('lab');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [crossSection, setCrossSection] = useState<boolean>(initialCrossSection);
  const [showShell, setShowShell] = useState<boolean>(true);
  const [showAxis, setShowAxis] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(!compact);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [enableWaves, setEnableWaves] = useState<boolean>(true);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<boolean>(false);

  // Mutable scene handles so React HUD updates never tear down the WebGLRenderer
  const sceneHandlesRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    gridHelper: THREE.GridHelper;
    outdoorGroup: THREE.Group;
    dynamicRoot: THREE.Group;
    waterHandle: WaterAssemblyHandle | null;
    inletCurve: THREE.CatmullRomCurve3 | null;
    outletCurve: THREE.CatmullRomCurve3 | null;
    isSoftwareGl: boolean;
    requestRender: () => void;
    drawImmediate: () => void;
    cameraGoalPos: THREE.Vector3 | null;
    cameraGoalTarget: THREE.Vector3 | null;
  } | null>(null);

  const liveFlagsRef = useRef({
    autoRotate,
    isPumping,
    isDraining,
    enableWaves,
  });
  liveFlagsRef.current = { autoRotate, isPumping, isDraining, enableWaves };

  // Mount WebGLRenderer & Scene ONCE
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    let currentWidth = Math.max(240, container.clientWidth);
    let currentHeight = Math.max(220, container.clientHeight);
    renderer.setSize(currentWidth, currentHeight);
    renderer.domElement.className = 'w-full h-full block outline-none';
    renderer.domElement.setAttribute('data-testid', 'tank-webgl-canvas');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.018);

    // Studio PBR environment reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, currentWidth / currentHeight, 0.1, 120);
    camera.position.set(5.4, 4.4, 6.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.0;
    controls.maxDistance = 32;
    controls.maxPolarAngle = Math.PI * 0.495;
    // Slightly lower camera target elevates the tank slightly in screen space, keeping the base clear of the bottom bar
    controls.target.set(0, TANK_BASE_Y + 0.85, 0);
    controls.update();

    // 3-point warm/cool studio lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xcbd5e1, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    keyLight.position.set(7, 12, 8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      const d = 7;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 32;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    rimLight.position.set(-7, 6, -6);
    scene.add(rimLight);

    // Coordinate Grid Floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x64748b, 0xcbd5e1);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const outdoorGroup = buildOutdoorBackdrop();
    outdoorGroup.visible = false;
    scene.add(outdoorGroup);

    const dynamicRoot = new THREE.Group();
    scene.add(dynamicRoot);

    const startTimeMs = performance.now();
    let lastTimeMs = startTimeMs;
    let frameId = 0;
    let timerId = 0;
    let unmounted = false;
    let renderBusy = false;
    let renderDirty = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext | null;
      if (!gl || typeof gl.fenceSync !== 'function') {
        timerId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (unmounted) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 85);
        }
      };
      timerId = window.setTimeout(poll, 6);
    }

    function stepAndDraw(): boolean {
      const handles = sceneHandlesRef.current;
      if (!handles) return false;

      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.1);
      lastTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;
      const flags = liveFlagsRef.current;

      let needsMoreFrames = false;

      // Smooth damped camera preset transitions
      if (handles.cameraGoalPos && handles.cameraGoalTarget) {
        const alpha = 1 - Math.exp(-7.5 * Math.max(dt, 0.016));
        camera.position.lerp(handles.cameraGoalPos, alpha);
        controls.target.lerp(handles.cameraGoalTarget, alpha);
        if (
          camera.position.distanceTo(handles.cameraGoalPos) < 0.02 &&
          controls.target.distanceTo(handles.cameraGoalTarget) < 0.02
        ) {
          camera.position.copy(handles.cameraGoalPos);
          controls.target.copy(handles.cameraGoalTarget);
          handles.cameraGoalPos = null;
          handles.cameraGoalTarget = null;
        } else {
          needsMoreFrames = true;
        }
      }

      controls.autoRotate = flags.autoRotate;
      controls.autoRotateSpeed = 1.8;
      if (flags.autoRotate) {
        needsMoreFrames = true;
      }

      const controlsChanged = controls.update();
      if (controlsChanged && !isSoftwareGl) {
        needsMoreFrames = true;
      }

      const activeWaterMotion =
        handles.waterHandle &&
        handles.inletCurve &&
        handles.outletCurve &&
        (flags.isPumping || flags.isDraining);

      if (handles.waterHandle && handles.inletCurve && handles.outletCurve) {
        updateWaterAnimation(
          handles.waterHandle,
          elapsed,
          handles.inletCurve,
          handles.outletCurve,
          flags.isPumping,
          flags.isDraining,
          flags.enableWaves,
        );
      }

      if (activeWaterMotion) {
        needsMoreFrames = true;
      }

      renderer.render(scene, camera);
      return Boolean(needsMoreFrames);
    }

    function drawImmediate() {
      if (unmounted) return;
      stepAndDraw();
    }

    function requestRender() {
      if (unmounted) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (unmounted) return;
        renderDirty = false;
        const keepGoing = stepAndDraw();
        const done = () => {
          renderBusy = false;
          if (unmounted) return;
          if (renderDirty || keepGoing) {
            requestRender();
          }
        };
        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    const onControlsStart = () => {
      if (sceneHandlesRef.current) {
        sceneHandlesRef.current.cameraGoalPos = null;
        sceneHandlesRef.current.cameraGoalTarget = null;
      }
    };
    const onControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('change', onControlsChange);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(200, Math.floor(entry.contentRect.width));
        const hPx = Math.max(200, Math.floor(entry.contentRect.height));
        if (w !== currentWidth || hPx !== currentHeight) {
          currentWidth = w;
          currentHeight = hPx;
          camera.aspect = w / hPx;
          camera.updateProjectionMatrix();
          renderer.setSize(w, hPx);
          // Draw synchronously right after resizing canvas so the cleared canvas buffer never flashes blank
          drawImmediate();
        }
      }
    });
    resizeObserver.observe(container);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
      drawImmediate();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    sceneHandlesRef.current = {
      renderer,
      scene,
      camera,
      controls,
      gridHelper,
      outdoorGroup,
      dynamicRoot,
      waterHandle: null,
      inletCurve: null,
      outletCurve: null,
      isSoftwareGl,
      requestRender,
      drawImmediate,
      cameraGoalPos: null,
      cameraGoalTarget: null,
    };

    return () => {
      unmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('change', onControlsChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      disposeObject3D(scene);
      renderer.dispose();
      sceneHandlesRef.current = null;
    };
  }, [compact]);

  // Rebuild tank & water meshes whenever mathematical parameters or visibility flags change
  useEffect(() => {
    const handles = sceneHandlesRef.current;
    if (!handles) return;

    const { dynamicRoot, isSoftwareGl, drawImmediate, requestRender } = handles;
    while (dynamicRoot.children.length > 0) {
      const child = dynamicRoot.children[0];
      dynamicRoot.remove(child);
      disposeObject3D(child);
    }

    const isNarrowViewport = typeof window !== 'undefined' && window.innerWidth < 768;
    const radialSegments = isSoftwareGl || isNarrowViewport || compact ? 36 : 64;
    const heightSamples = isSoftwareGl || isNarrowViewport || compact ? 44 : 72;

    const tankBuilt = buildTankAssembly(parameters, {
      crossSection,
      showShell,
      showAxis,
      showDimensions,
      radialSegments,
      heightSamples,
      isSoftwareGl,
    });
    dynamicRoot.add(tankBuilt.group);

    const waterBuilt = buildWaterAssembly(
      parameters,
      tankBuilt.inletPipeCurve,
      tankBuilt.outletPipeCurve,
      {
        crossSection,
        radialSegments,
        heightSamples,
        enableWaves,
      },
    );
    dynamicRoot.add(waterBuilt.group);

    handles.waterHandle = waterBuilt;
    handles.inletCurve = tankBuilt.inletPipeCurve;
    handles.outletCurve = tankBuilt.outletPipeCurve;

    drawImmediate();
    if (liveFlagsRef.current.isPumping || liveFlagsRef.current.isDraining || liveFlagsRef.current.autoRotate) {
      requestRender();
    }
  }, [parameters, crossSection, showShell, showAxis, showDimensions, enableWaves, compact]);

  // Sync environment mode, grid, and active pumping/draining animation loop
  useEffect(() => {
    const handles = sceneHandlesRef.current;
    if (!handles) return;

    handles.gridHelper.visible = showGrid;
    handles.outdoorGroup.visible = envMode === 'outdoor';
    const bgHex = envMode === 'outdoor' ? 0xe0f2fe : 0xf1f5f9;
    handles.scene.background = new THREE.Color(bgHex);
    handles.scene.fog = new THREE.FogExp2(bgHex, envMode === 'outdoor' ? 0.014 : 0.018);

    handles.drawImmediate();
    if (autoRotate || isPumping || isDraining) {
      handles.requestRender();
    }
  }, [envMode, showGrid, autoRotate, isPumping, isDraining]);

  const applyCameraPreset = (preset: CameraPreset) => {
    const handles = sceneHandlesRef.current;
    if (!handles) return;
    const H = Math.max(1, parameters.H);
    const centerY = TANK_BASE_Y + H * 0.42;
    const dist = Math.max(4.9, H * 1.92);

    handles.cameraGoalTarget = new THREE.Vector3(0, centerY, 0);
    switch (preset) {
      case 'front':
        handles.cameraGoalPos = new THREE.Vector3(0, centerY + 0.35, dist * 1.32);
        break;
      case 'side':
        handles.cameraGoalPos = new THREE.Vector3(dist * 1.35, centerY + 0.35, 0.01);
        break;
      case 'top':
        handles.cameraGoalPos = new THREE.Vector3(0.01, TANK_BASE_Y + H + dist * 1.35, 0.25);
        break;
      case 'iso':
      default:
        handles.cameraGoalPos = new THREE.Vector3(dist * 0.95, centerY + dist * 0.55, dist * 1.05);
        break;
    }
    handles.requestRender();
  };

  const handleExportGLB = () => {
    const handles = sceneHandlesRef.current;
    if (!handles) return;
    setExportStatus('Đang xuất .GLB...');
    const exporter = new GLTFExporter();
    exporter.parse(
      handles.dynamicRoot,
      (result) => {
        const blob =
          result instanceof ArrayBuffer
            ? new Blob([result], { type: 'model/gltf-binary' })
            : new Blob([JSON.stringify(result)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `smart-water-tank-${parameters.type}.glb`;
        link.click();
        URL.revokeObjectURL(url);
        setExportStatus('Đã tải tệp .GLB');
        window.setTimeout(() => setExportStatus(null), 2500);
      },
      () => {
        setExportStatus('Lỗi xuất .GLB');
        window.setTimeout(() => setExportStatus(null), 2500);
      },
      { binary: true },
    );
  };

  if (webglError) {
    return (
      <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center bg-slate-100 border border-slate-200 rounded-xl p-6 text-center">
        <Box className="w-10 h-10 text-slate-500 mb-2" />
        <p className="text-sm font-semibold text-slate-800">
          Trình duyệt tạm thời không khả dụng ngữ cảnh WebGL 3D
        </p>
        <p className="text-xs text-slate-600 mt-1 max-w-md">
          Các phép tính tích phân, đồ thị và mô phỏng số học vẫn hoạt động chính xác 100%.
        </p>
      </div>
    );
  }

  const resolvedHeightClass =
    heightClass ?? (compact ? 'h-[270px]' : 'h-[460px] lg:h-[540px]');

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${resolvedHeightClass}`}
    >
      {/* Dedicated WebGL Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top-Left Minimal Spec Header */}
      {titleBadge && (
        <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg bg-slate-900/85 px-3 py-1.5 text-xs font-medium text-slate-100">
          {titleBadge}
        </div>
      )}

      {/* Sleek Single-Row Floating Bottom Control Bar (Expandable Secondary Options) */}
      {!compact && (
        <div className="absolute bottom-2.5 left-1/2 z-10 w-[95%] max-w-[780px] -translate-x-1/2 flex flex-col items-center gap-1.5">
          {moreOptionsOpen && (
            <div className="w-full rounded-xl bg-slate-900/95 px-3 py-2 text-slate-100 shadow-lg border border-slate-700/80 flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => applyCameraPreset('top')}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Nhìn từ trên
              </button>

              <button
                type="button"
                onClick={() => applyCameraPreset('front')}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Eye className="w-3.5 h-3.5" />
                Nhìn ngang
              </button>

              <button
                type="button"
                onClick={() => setShowGrid((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  showGrid
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Lưới tọa độ
              </button>

              <button
                type="button"
                onClick={() => setShowShell((v) => !v)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  showShell ? 'bg-slate-700 text-white' : 'bg-slate-800/70 text-slate-400'
                }`}
              >
                Vỏ bồn
              </button>

              <button
                type="button"
                onClick={() => setShowAxis((v) => !v)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  showAxis ? 'bg-slate-700 text-white' : 'bg-slate-800/70 text-slate-400'
                }`}
              >
                Trục Oz
              </button>

              <button
                type="button"
                onClick={() => setShowDimensions((v) => !v)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  showDimensions ? 'bg-slate-700 text-white' : 'bg-slate-800/70 text-slate-400'
                }`}
              >
                Kích thước
              </button>

              <button
                type="button"
                onClick={() => setEnableWaves((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  enableWaves ? 'bg-slate-700 text-cyan-300' : 'bg-slate-800/70 text-slate-400'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                Sóng
              </button>
            </div>
          )}

          <div className="rounded-xl bg-slate-900/92 px-2.5 py-1.5 text-slate-100 shadow-lg border border-slate-700/80 flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                autoRotate
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              Xoay 360°
            </button>

            <button
              type="button"
              onClick={() => setCrossSection((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                crossSection
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Mặt cắt
            </button>

            <button
              type="button"
              onClick={() => setEnvMode((m) => (m === 'lab' ? 'outdoor' : 'lab'))}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-amber-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Sun className="w-3.5 h-3.5" />
              {envMode === 'lab' ? 'Chế độ Thực tế' : 'Chế độ Phòng TN'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAutoRotate(false);
                applyCameraPreset('iso');
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại
            </button>

            <button
              type="button"
              onClick={() => setMoreOptionsOpen((v) => !v)}
              aria-expanded={moreOptionsOpen}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                moreOptionsOpen
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Tùy chọn
            </button>

            <button
              type="button"
              onClick={handleExportGLB}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-cyan-600 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              {exportStatus ?? 'Xuất .GLB'}
            </button>
          </div>
        </div>
      )}

      {/* Compact controls for mini 3D viewports */}
      {compact && (
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCrossSection((v) => !v)}
            className="rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
          >
            {crossSection ? 'Đóng cắt' : 'Mặt cắt'}
          </button>
          <button
            type="button"
            onClick={() => applyCameraPreset('iso')}
            className="rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
            aria-label="Đặt lại góc nhìn 3D"
          >
            Đặt lại
          </button>
        </div>
      )}
    </div>
  );
};
