export type Intensity = 'low' | 'medium' | 'high';

export type ActionStatus = 'pending' | 'completed' | 'reduce' | 'skip';

export interface WorkoutAction {
  id: string;
  name: string;
  targetMuscle: string;
  equipment: string;
  sets: number;
  reps: number;
  intensity: Intensity;
  duration: number;
  notes: string;
  status: ActionStatus;
  order: number;
}

export interface FilterOptions {
  targetMuscle: string[];
  equipment: string[];
  intensity: string[];
  status: string[];
  durationMin: number | null;
  durationMax: number | null;
}

export interface RiskItem {
  id: string;
  type: 'warning' | 'error';
  message: string;
  actionIds?: string[];
}

export const TARGET_MUSCLES = [
  '胸部',
  '背部',
  '肩部',
  '手臂',
  '核心',
  '腿部',
  '臀部',
  '全身',
];

export const EQUIPMENTS = [
  '哑铃',
  '杠铃',
  '器械',
  '自重',
  '弹力带',
  '壶铃',
  '其他',
];

export const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: 'low', label: '低强度' },
  { value: 'medium', label: '中强度' },
  { value: 'high', label: '高强度' },
];

export const STATUS_OPTIONS: { value: ActionStatus; label: string }[] = [
  { value: 'pending', label: '待训练' },
  { value: 'completed', label: '已完成' },
  { value: 'reduce', label: '需降强度' },
  { value: 'skip', label: '跳过' },
];

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  actions: WorkoutAction[];
  createdAt: number;
  updatedAt: number;
}

export interface MuscleProgress {
  muscle: string;
  total: number;
  completed: number;
  pending: number;
  skip: number;
  reduce: number;
  percentage: number;
}

export interface WorkoutProgress {
  totalActions: number;
  totalDuration: number;
  completedCount: number;
  pendingCount: number;
  skipCount: number;
  reduceCount: number;
  completedDuration: number;
  effectiveDuration: number;
  overallPercentage: number;
  muscleProgress: MuscleProgress[];
}
