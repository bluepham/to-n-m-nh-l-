import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TANK_PARAMETERS,
  calculateSideArea,
  calculateSurfaceArea,
  calculateTotalVolume,
  calculateWaterRiseRate,
  calculateWaterVolume,
  findHeightFromVolume,
  radiusAtHeight,
  runInternalTestSuite,
  scanCandidateTankDesigns,
  simulatePumpStep,
  validateTankParameters,
} from './MathEngine';
import { TankParameters } from '../types';

const TOL = 1e-4;

test('Test 01: Cylinder volume and half-height water volume', () => {
  const cyl: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'cylinder',
    R: 1,
    H: 2,
    h: 1,
  };
  assert.ok(Math.abs(calculateTotalVolume(cyl) - 2 * Math.PI) < TOL);
  assert.ok(Math.abs(calculateWaterVolume(1, cyl) - Math.PI) < TOL);
});

test('Test 02: Frustum exact volume r0=1, r1=2, H=3 -> 7*pi', () => {
  const frustum: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'frustum',
    r0: 1,
    r1: 2,
    H: 3,
    h: 1.5,
  };
  assert.ok(Math.abs(calculateTotalVolume(frustum) - 7 * Math.PI) < TOL);
});

test('Test 03: Curved tank r(z) = 1 + 0.5*sin(pi*z/2), H=2 -> 2.25*pi + 4', () => {
  const curved: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'curved',
    curveA: 1,
    curveB: 0.5,
    H: 2,
    h: 1,
  };
  const expected = 2.25 * Math.PI + 4;
  assert.ok(Math.abs(calculateTotalVolume(curved) - expected) < TOL);
});

test('Test 04: Poster Hemisphere example r(z) = sqrt(4 - z^2), 0 <= z <= 2 -> 16*pi/3', () => {
  const hemi: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'custom',
    customMode: 'expression',
    customExpression: 'sqrt(4 - z^2)',
    H: 2,
    h: 1,
  };
  assert.equal(validateTankParameters(hemi).valid, true);
  assert.equal(radiusAtHeight(0, hemi), 2);
  assert.equal(radiusAtHeight(2, hemi), 0);
  const expected = (16 * Math.PI) / 3;
  assert.ok(Math.abs(calculateTotalVolume(hemi) - expected) < TOL);
  // Also check hemisphere curved surface area = 2 * pi * R^2 = 8 * pi
  assert.ok(Math.abs(calculateSideArea(hemi) - 8 * Math.PI) < 0.02);
});

test('Test 05, 06, 07: Pump simulation and non-linear height inversion', () => {
  const cyl: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'cylinder',
    R: 1,
    H: 2,
    h: 0,
  };
  const after6Min = simulatePumpStep(0, 0.5, 0, 6, cyl);
  assert.ok(Math.abs(after6Min.volume - 3) < TOL);
  assert.ok(Math.abs(after6Min.height - 3 / Math.PI) < TOL);

  // Full clamp
  const vMax = calculateTotalVolume(cyl);
  const overflow = simulatePumpStep(vMax, 2, 0, 5, cyl);
  assert.ok(Math.abs(overflow.volume - vMax) < 1e-6);
  assert.equal(overflow.isFull, true);

  // Empty clamp
  const underflow = simulatePumpStep(0, 0, 2, 5, cyl);
  assert.equal(underflow.volume, 0);
  assert.equal(underflow.height, 0);
  assert.equal(underflow.isEmpty, true);

  // Verify non-linear height inversion for frustum (must NOT equal H * V / Vmax)
  const frustum: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'frustum',
    r0: 0.5,
    r1: 2.0,
    H: 3.0,
    h: 0,
  };
  const halfVol = calculateTotalVolume(frustum) * 0.5;
  const solvedH = findHeightFromVolume(halfVol, frustum);
  assert.ok(solvedH > 1.8, 'Wider-top frustum reaches 50% volume above H/2');
  assert.ok(Math.abs(calculateWaterVolume(solvedH, frustum) - halfVol) < 1e-5);
});

test('Test 08 & Security: Reject invalid inputs and unsafe expressions', () => {
  assert.equal(
    validateTankParameters({ ...DEFAULT_TANK_PARAMETERS, type: 'cylinder', R: 1, H: -1 }).valid,
    false,
  );
  assert.equal(
    validateTankParameters({ ...DEFAULT_TANK_PARAMETERS, type: 'cylinder', R: 0, H: 2 }).valid,
    false,
  );
  assert.equal(
    validateTankParameters({
      ...DEFAULT_TANK_PARAMETERS,
      type: 'custom',
      customMode: 'expression',
      customExpression: 'window.alert(1)',
    }).valid,
    false,
  );
});

test('Test 11 & dh/dt singularity handling & candidate scan', () => {
  const cyl: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'cylinder',
    R: 1,
    H: 2,
    h: 1,
  };
  assert.ok(Math.abs(calculateSideArea(cyl) - 4 * Math.PI) < TOL);
  assert.ok(Math.abs(calculateSurfaceArea(cyl, 'closed') - 6 * Math.PI) < TOL);

  // Hemisphere top z=2 has r(2)=0 -> dh/dt must return null, never Infinity
  const hemi: TankParameters = {
    ...DEFAULT_TANK_PARAMETERS,
    type: 'custom',
    customMode: 'expression',
    customExpression: 'sqrt(4 - z^2)',
    H: 2,
    h: 2,
  };
  assert.equal(calculateWaterRiseRate(2, 0.5, 0, hemi), null);

  // Candidate scan
  const scan = scanCandidateTankDesigns({
    vTarget: 10,
    hMin: 1,
    hMax: 5,
    rMax: 3,
    unitCostVnd: 850000,
    surfaceMode: 'closed',
  });
  assert.ok(scan.scannedCount > 20);
  assert.ok(scan.bestCandidates.length > 0);
  assert.ok(scan.bestCandidates[0].volume >= 10 * 0.998);

  // Full 12-test suite passes
  const all12 = runInternalTestSuite();
  assert.equal(all12.length, 12);
  for (const t of all12) {
    assert.equal(t.passed, true, `${t.id} failed: ${t.errorInfo ?? t.actual}`);
  }
});
