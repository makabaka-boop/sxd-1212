import type { WorkoutAction } from '../types';

export function calculateActionDuration(action: WorkoutAction): number {
  return action.sets * action.duration;
}

export function calculateTotalDuration(actions: WorkoutAction[]): number {
  return actions.reduce((total, action) => {
    return total + calculateActionDuration(action);
  }, 0);
}

export function calculateEffectiveDuration(actions: WorkoutAction[]): number {
  return actions
    .filter((action) => action.status !== 'skip')
    .reduce((total, action) => {
      return total + calculateActionDuration(action);
    }, 0);
}

export function calculateCompletedDuration(actions: WorkoutAction[]): number {
  return actions
    .filter((action) => action.status === 'completed')
    .reduce((total, action) => {
      return total + calculateActionDuration(action);
    }, 0);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
}

export function formatDurationShort(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}
