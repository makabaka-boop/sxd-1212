import type { WorkoutAction } from '../types';

const STORAGE_KEY = 'workout-planner-data';
const PLAN_DURATION_KEY = 'workout-planner-plan-duration';

export function saveToStorage(actions: WorkoutAction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

export function loadFromStorage(): WorkoutAction[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('加载数据失败:', error);
    return null;
  }
}

export function savePlanDuration(duration: number): void {
  try {
    localStorage.setItem(PLAN_DURATION_KEY, String(duration));
  } catch (error) {
    console.error('保存计划时长失败:', error);
  }
}

export function loadPlanDuration(): number {
  try {
    const data = localStorage.getItem(PLAN_DURATION_KEY);
    if (data) {
      return Number(data);
    }
    return 60;
  } catch (error) {
    console.error('加载计划时长失败:', error);
    return 60;
  }
}

export function exportToJSON(actions: WorkoutAction[]): string {
  return JSON.stringify(actions, null, 2);
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSON(jsonString: string): WorkoutAction[] | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('解析JSON失败:', error);
    return null;
  }
}
