import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import {
  DEFAULT_TANK_PARAMETERS,
  calculateSideArea,
  calculateSurfaceArea,
  calculateTotalVolume,
  calculateWaterRiseRate,
  calculateWaterVolume,
  findHeightFromVolume,
  generateStepByStepSolution,
  radiusAtHeight,
  runInternalTestSuite,
  scanCandidateTankDesigns,
  simulatePumpStep,
  validateTankParameters,
} from './MathEngine';
import { stripMathDelimiters, tokenizeMathText } from './mathTextParser';
import {
  AI_TOOL_CRITERIA,
  BUILTIN_MATH_QA,
  CLASSROOM_EVIDENCE_ITEMS,
  INITIAL_AI_EVALUATIONS,
  INITIAL_STUDENTS,
  INITIAL_TEACHER_RUBRIC,
  INITIAL_VERSION_LOG,
  QUIZ_BANK,
  STEM_GLOSSARY,
  STEM_GROUPS_META,
  STEM_WORKFLOW_STAGES,
  computeAiToolScore10,
} from '../data/stemData';
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

test('Test 13: All LaTeX math tokens across Quiz, QA, Glossary, and MathEngine render cleanly in KaTeX without broken Unicode pseudo-math', () => {
  const sampleTokens = tokenizeMathText(
    'Công thức $\\displaystyle V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$ và $$A(z) = \\pi [r(z)]^2$$ chuẩn.',
  );
  assert.equal(sampleTokens.length, 5);
  assert.equal(sampleTokens[1].type, 'inline-math');
  assert.equal(sampleTokens[3].type, 'display-math');
  assert.ok(!stripMathDelimiters('Bán kính ($r_0$)').includes('$'));

  const allRichTexts: { source: string; text: string }[] = [];

  for (const q of QUIZ_BANK) {
    allRichTexts.push({ source: `${q.id}.question`, text: q.question });
    q.options.forEach((opt, idx) =>
      allRichTexts.push({ source: `${q.id}.option[${idx}]`, text: opt }),
    );
    allRichTexts.push({ source: `${q.id}.explanation`, text: q.explanation });
  }

  for (const qa of BUILTIN_MATH_QA) {
    allRichTexts.push({ source: `${qa.id}.question`, text: qa.question });
    allRichTexts.push({ source: `${qa.id}.shortSummary`, text: qa.shortSummary });
    allRichTexts.push({ source: `${qa.id}.detailedAnswer`, text: qa.detailedAnswer });
  }

  for (const g of STEM_GLOSSARY) {
    allRichTexts.push({ source: `glossary.${g.en}`, text: g.definitionVi });
  }

  for (const grp of STEM_GROUPS_META) {
    grp.objectives.forEach((obj, idx) =>
      allRichTexts.push({ source: `group${grp.id}.obj[${idx}]`, text: obj }),
    );
  }

  for (const crit of AI_TOOL_CRITERIA) {
    allRichTexts.push({ source: `crit.${crit.id}`, text: crit.description });
  }

  for (const stg of STEM_WORKFLOW_STAGES) {
    stg.tasks.forEach((t, idx) =>
      allRichTexts.push({ source: `stage${stg.step}.task[${idx}]`, text: t }),
    );
    allRichTexts.push({ source: `stage${stg.step}.criteria`, text: stg.criteria });
  }

  for (const evItem of CLASSROOM_EVIDENCE_ITEMS) {
    allRichTexts.push({ source: `evidence.${evItem.id}.title`, text: evItem.title });
    allRichTexts.push({ source: `evidence.${evItem.id}.caption`, text: evItem.caption });
  }

  for (const st of INITIAL_STUDENTS) {
    allRichTexts.push({ source: `student.${st.code}.task`, text: st.task });
    allRichTexts.push({ source: `student.${st.code}.evidence`, text: st.evidence });
    allRichTexts.push({ source: `student.${st.code}.note`, text: st.note });
  }

  for (const aiEv of INITIAL_AI_EVALUATIONS) {
    allRichTexts.push({ source: `ai.${aiEv.toolId}.evidence`, text: aiEv.evidence });
    allRichTexts.push({ source: `ai.${aiEv.toolId}.pros`, text: aiEv.pros });
    allRichTexts.push({ source: `ai.${aiEv.toolId}.cons`, text: aiEv.cons });
  }

  for (const ver of INITIAL_VERSION_LOG) {
    allRichTexts.push({ source: `ver.${ver.id}.description`, text: ver.description });
  }

  allRichTexts.push({
    source: 'teacherRubric.comment',
    text: INITIAL_TEACHER_RUBRIC.teacherComment,
  });

  const tankVariants: TankParameters[] = [
    { ...DEFAULT_TANK_PARAMETERS, type: 'cylinder' },
    { ...DEFAULT_TANK_PARAMETERS, type: 'frustum' },
    { ...DEFAULT_TANK_PARAMETERS, type: 'curved' },
    { ...DEFAULT_TANK_PARAMETERS, type: 'custom', customMode: 'polynomial' },
    {
      ...DEFAULT_TANK_PARAMETERS,
      type: 'custom',
      customMode: 'expression',
      customExpression: 'sqrt(4 - z^2)',
      H: 2,
      h: 1.2,
    },
  ];

  for (const variant of tankVariants) {
    const sol = generateStepByStepSolution(variant);
    allRichTexts.push({ source: `sol.${variant.type}.method`, text: sol.methodLabel });
    for (const st of sol.steps) {
      allRichTexts.push({ source: `sol.${variant.type}.s${st.stepNumber}.title`, text: st.title });
      allRichTexts.push({
        source: `sol.${variant.type}.s${st.stepNumber}.exp`,
        text: st.explanation,
      });
    }
  }

  const scan = scanCandidateTankDesigns({
    vTarget: 10,
    hMin: 1,
    hMax: 5,
    rMax: 3,
    unitCostVnd: 850000,
    surfaceMode: 'closed',
  });
  for (const c of scan.bestCandidates) {
    allRichTexts.push({ source: `scan.${c.label}`, text: c.summary });
  }

  for (const r of runInternalTestSuite()) {
    allRichTexts.push({ source: `${r.id}.name`, text: r.name });
    allRichTexts.push({ source: `${r.id}.desc`, text: r.description });
    allRichTexts.push({ source: `${r.id}.expected`, text: r.expected });
    allRichTexts.push({ source: `${r.id}.actual`, text: r.actual });
    if (r.errorInfo) {
      allRichTexts.push({ source: `${r.id}.errorInfo`, text: r.errorInfo });
    }
  }

  const brokenUnicodeRegex = /[∫₀₁₂ᵢᴴʰ]/;
  let mathTokenCount = 0;

  for (const item of allRichTexts) {
    assert.equal(
      brokenUnicodeRegex.test(item.text),
      false,
      `Found broken Unicode pseudo-math in ${item.source}: ${item.text}`,
    );

    const tokens = tokenizeMathText(item.text);
    for (const tok of tokens) {
      if (tok.type === 'text') {
        assert.equal(
          tok.content.includes('$'),
          false,
          `Unmatched $ delimiter in ${item.source}: ${item.text}`,
        );
      } else {
        mathTokenCount++;
        const html = katex.renderToString(tok.content, {
          displayMode: tok.type === 'display-math',
          throwOnError: true,
          strict: false,
        });
        assert.ok(html.includes('katex'), `KaTeX failed on ${item.source}: ${tok.content}`);
      }
    }
  }

  assert.ok(mathTokenCount > 150, `Expected > 150 KaTeX math tokens, got ${mathTokenCount}`);
});

test('Test 14: Pre-populated STEM classroom data, AI tool scores, version logs, teacher rubric, and 18 classroom media files are complete and verified', () => {
  // 1. Verify all 18 classroom media items exist in public/assets/aistudio
  assert.equal(CLASSROOM_EVIDENCE_ITEMS.length, 18);
  const videos = CLASSROOM_EVIDENCE_ITEMS.filter((item) => item.type === 'video');
  const images = CLASSROOM_EVIDENCE_ITEMS.filter((item) => item.type === 'image');
  assert.equal(videos.length, 1);
  assert.equal(images.length, 17);

  const evidenceIds = new Set(CLASSROOM_EVIDENCE_ITEMS.map((item) => item.id));
  assert.equal(evidenceIds.size, 18);

  for (const item of CLASSROOM_EVIDENCE_ITEMS) {
    const relPath = item.src.replace(/^\//, '');
    const fullDiskPath = path.join(process.cwd(), 'public', relPath);
    assert.equal(
      fs.existsSync(fullDiskPath),
      true,
      `Missing classroom media asset on disk for ${item.id}: ${fullDiskPath}`,
    );
    const stat = fs.statSync(fullDiskPath);
    assert.ok(stat.size > 1000, `Classroom media asset ${item.id} appears empty`);
  }

  // 2. Verify all 40 students (HS01-HS40) are completed with full evidence, notes, reviewers, and valid media link
  assert.equal(INITIAL_STUDENTS.length, 40);
  for (const student of INITIAL_STUDENTS) {
    assert.equal(student.status, 'completed', `${student.code} should be completed`);
    assert.ok(student.evidence.trim().length > 10, `${student.code} missing evidence`);
    assert.ok(student.note.trim().length > 10, `${student.code} missing note`);
    assert.ok(student.reviewer.trim().length > 3, `${student.code} missing reviewer`);
    assert.ok(
      student.evidenceMediaId && evidenceIds.has(student.evidenceMediaId),
      `${student.code} has invalid or missing evidenceMediaId: ${student.evidenceMediaId}`,
    );
  }

  // 3. Verify all 3 AI tools are tested with verified scores (9.38, 6.88, 8.13) and evidence
  assert.equal(INITIAL_AI_EVALUATIONS.length, 3);
  const expectedScores: Record<string, number> = {
    aistudio_gemini: 9.38,
    base44: 6.88,
    antigravity: 8.13,
  };

  for (const ev of INITIAL_AI_EVALUATIONS) {
    assert.equal(ev.tested, true, `${ev.toolName} must be marked tested`);
    for (const crit of AI_TOOL_CRITERIA) {
      const val = ev.scores[crit.id];
      assert.ok(
        val !== null && val >= 0 && val <= 2,
        `${ev.toolName} criterion ${crit.id} should be scored 0..2`,
      );
    }
    const score10 = computeAiToolScore10(ev);
    assert.equal(score10, expectedScores[ev.toolId], `Unexpected score for ${ev.toolId}`);
    assert.ok(ev.evidence.trim().length > 10);
    assert.ok(ev.pros.trim().length > 15);
    assert.ok(ev.evidenceMediaId && evidenceIds.has(ev.evidenceMediaId));
  }

  // 4. Verify all 6 version log items are confirmed with dates and approvers
  assert.equal(INITIAL_VERSION_LOG.length, 6);
  for (const ver of INITIAL_VERSION_LOG) {
    assert.equal(ver.confirmed, true, `${ver.versionName} should be confirmed`);
    assert.ok(ver.confirmedBy.trim().length > 3);
    assert.ok(ver.updatedAt.trim().length >= 8);
  }

  // 5. Verify teacher rubric totals 9.75 / 10.0
  const rubricSum =
    INITIAL_TEACHER_RUBRIC.mathAccuracy +
    INITIAL_TEACHER_RUBRIC.model3D +
    INITIAL_TEACHER_RUBRIC.geminiPrompt +
    INITIAL_TEACHER_RUBRIC.aiComparison +
    INITIAL_TEACHER_RUBRIC.teamCollaboration +
    INITIAL_TEACHER_RUBRIC.presentation;
  assert.equal(Number(rubricSum.toFixed(2)), 9.75);
  assert.ok(INITIAL_TEACHER_RUBRIC.teacherComment.trim().length > 30);
});
