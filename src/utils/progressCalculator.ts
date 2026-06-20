import type { WorkoutAction, WorkoutProgress, MuscleProgress } from '../types';
import {
  calculateActionDuration,
  calculateTotalDuration,
  calculateCompletedDuration,
  calculateEffectiveDuration,
} from './timeCalculator';

export function calculateWorkoutProgress(actions: WorkoutAction[]): WorkoutProgress {
  const totalActions = actions.length;
  const totalDuration = calculateTotalDuration(actions);
  const completedDuration = calculateCompletedDuration(actions);
  const effectiveDuration = calculateEffectiveDuration(actions);

  let completedCount = 0;
  let pendingCount = 0;
  let skipCount = 0;
  let reduceCount = 0;

  const muscleMap = new Map<string, MuscleProgress>();

  actions.forEach((action) => {
    switch (action.status) {
      case 'completed':
        completedCount++;
        break;
      case 'pending':
        pendingCount++;
        break;
      case 'skip':
        skipCount++;
        break;
      case 'reduce':
        reduceCount++;
        break;
    }

    const muscle = action.targetMuscle;
    if (!muscleMap.has(muscle)) {
      muscleMap.set(muscle, {
        muscle,
        total: 0,
        completed: 0,
        pending: 0,
        skip: 0,
        reduce: 0,
        percentage: 0,
      });
    }

    const muscleData = muscleMap.get(muscle)!;
    muscleData.total++;

    switch (action.status) {
      case 'completed':
        muscleData.completed++;
        break;
      case 'pending':
        muscleData.pending++;
        break;
      case 'skip':
        muscleData.skip++;
        break;
      case 'reduce':
        muscleData.reduce++;
        break;
    }
  });

  const muscleProgress: MuscleProgress[] = Array.from(muscleMap.values()).map(
    (m) => ({
      ...m,
      percentage: m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0,
    })
  );

  const effectiveActions = completedCount + pendingCount + reduceCount;
  const remainingDuration = effectiveDuration - completedDuration;

  const overallPercentage =
    effectiveActions > 0
      ? Math.round((completedCount / effectiveActions) * 100)
      : 0;

  return {
    totalActions,
    effectiveActions,
    totalDuration,
    completedCount,
    pendingCount,
    skipCount,
    reduceCount,
    completedDuration,
    effectiveDuration,
    remainingDuration,
    overallPercentage,
    muscleProgress,
  };
}
