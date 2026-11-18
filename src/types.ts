export type TankType = 'cylinder' | 'frustum' | 'curved' | 'custom';

export type CustomFormulaMode = 'polynomial' | 'expression';

export type SurfaceIncludeMode = 'closed' | 'open_top' | 'side_only';

export type AppTab =
  | 'overview'
  | 'design3d'
  | 'math'
  | 'pump'
  | 'charts'
  | 'optimize_practice';

export type LanguageMode = 'vi' | 'en';

export interface TankParameters {
  type: TankType;
  H: number; // Total height (m)
  h: number; // Current water height (m)
  // Cylinder
  R: number;
  // Frustum
  r0: number;
  r1: number;
  // Curved: r(z) = a + b * sin(pi * z / H)  OR Polynomial: r(z) = polyA + polyB*z + polyC*z^2
  curveA: number;
  curveB: number;
  // Custom
  customMode: CustomFormulaMode;
  polyA: number;
  polyB: number;
  polyC: number;
  customExpression: string;
  presetLabel?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export interface SurfaceAreaBreakdown {
  side: number;
  bottom: number;
  top: number;
  total: number;
}

export interface MathStepItem {
  stepNumber: number;
  title: string;
  explanation: string;
  latex: string;
}

export interface MathSolutionReport {
  isExactSymbolic: boolean;
  methodLabel: string;
  radiusLatex: string;
  areaLatex: string;
  totalIntegralLatex: string;
  waterIntegralLatex: string;
  steps: MathStepItem[];
}

export interface FlowHistoryPoint {
  timeMin: number;
  timeLabel: string;
  volumeM3: number;
  heightM: number;
  compareVolumeM3?: number;
}

export type PumpMode = 'idle' | 'pumping' | 'draining' | 'both' | 'paused';

export type FlowUnit = 'm3_min' | 'l_min';

export interface OptimizationConstraints {
  vTarget: number;
  hMin: number;
  hMax: number;
  rMax: number;
  unitCostVnd: number;
  surfaceMode: SurfaceIncludeMode;
}

export interface CandidateScanResult {
  label: string;
  type: TankType;
  params: TankParameters;
  volume: number;
  surfaceArea: number;
  estimatedCost: number;
  summary: string;
}

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending_review'
  | 'completed'
  | 'needs_revision';

export type EvidenceCategory = 'lecture' | 'lab_3d_casio' | 'group_work';

export interface ClassroomEvidenceItem {
  id: string;
  type: 'video' | 'image';
  category: EvidenceCategory;
  title: string;
  caption: string;
  src: string;
  posterSrc?: string;
  groupIds: (1 | 2 | 3 | 4)[];
  dateLabel: string;
}

export interface StudentAssignment {
  code: string; // HS01 .. HS40
  groupId: 1 | 2 | 3 | 4;
  groupName: string;
  task: string;
  status: TaskStatus;
  evidence: string;
  note: string;
  reviewer: string;
  evidenceMediaId?: string;
}

export interface AIToolCriterionScore {
  criterionId: string;
  criterionName: string;
  maxScore: number; // e.g. 2 or 1 to sum to 10, or 8 criteria 0-2 normalized/capped
}

export interface AIToolEvaluation {
  toolId: 'aistudio_gemini' | 'base44' | 'antigravity';
  toolName: string;
  tested: boolean;
  scores: Record<string, number | null>; // null = not yet evaluated
  evidence: string;
  pros: string;
  cons: string;
  evidenceMediaId?: string;
}

export interface VersionLogItem {
  id: string;
  versionName: string;
  description: string;
  confirmed: boolean;
  confirmedBy: string;
  updatedAt: string;
}

export interface TeacherRubricState {
  mathAccuracy: number; // max 3.0
  model3D: number; // max 2.0
  geminiPrompt: number; // max 1.5
  aiComparison: number; // max 1.0
  teamCollaboration: number; // max 1.5
  presentation: number; // max 1.0
  teacherComment: string;
}

export interface InternalTestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  errorInfo?: string;
}
