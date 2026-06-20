import type { WorkoutAction, FilterOptions } from '../types';

export function filterActions(
  actions: WorkoutAction[],
  filters: FilterOptions
): WorkoutAction[] {
  return actions.filter((action) => {
    if (
      filters.targetMuscle.length > 0 &&
      !filters.targetMuscle.includes(action.targetMuscle)
    ) {
      return false;
    }
    if (
      filters.equipment.length > 0 &&
      !filters.equipment.includes(action.equipment)
    ) {
      return false;
    }
    if (
      filters.intensity.length > 0 &&
      !filters.intensity.includes(action.intensity)
    ) {
      return false;
    }
    if (
      filters.status.length > 0 &&
      !filters.status.includes(action.status)
    ) {
      return false;
    }
    const totalDuration = action.sets * action.duration;
    if (filters.durationMin !== null && totalDuration < filters.durationMin) {
      return false;
    }
    if (filters.durationMax !== null && totalDuration > filters.durationMax) {
      return false;
    }
    return true;
  });
}
