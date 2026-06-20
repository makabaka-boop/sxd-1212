import type { WorkoutAction, RiskItem } from '../types';

export function detectRisks(
  actions: WorkoutAction[],
  plannedDuration: number
): RiskItem[] {
  const risks: RiskItem[] = [];

  risks.push(...checkConsecutiveHighIntensity(actions));
  risks.push(...checkMissingNotes(actions));
  risks.push(...checkZeroSetsOrReps(actions));
  risks.push(...checkDurationExceedPlan(actions, plannedDuration));
  risks.push(...checkSkippedCountedInDuration(actions));

  return risks;
}

function checkConsecutiveHighIntensity(actions: WorkoutAction[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  let consecutiveHigh: WorkoutAction[] = [];

  for (let i = 0; i < sortedActions.length; i++) {
    const action = sortedActions[i];
    if (action.status === 'skip') continue;

    if (action.intensity === 'high') {
      if (consecutiveHigh.length > 0) {
        const prev = consecutiveHigh[consecutiveHigh.length - 1];
        if (prev.targetMuscle === action.targetMuscle) {
          consecutiveHigh.push(action);
        } else {
          if (consecutiveHigh.length >= 2) {
            risks.push({
              id: `consecutive-high-${consecutiveHigh[0].id}`,
              type: 'warning',
              message: `${consecutiveHigh[0].targetMuscle}部位连续${consecutiveHigh.length}个高强度动作，建议穿插低强度动作或休息`,
              actionIds: consecutiveHigh.map((a) => a.id),
            });
          }
          consecutiveHigh = [action];
        }
      } else {
        consecutiveHigh.push(action);
      }
    } else {
      if (consecutiveHigh.length >= 2) {
        risks.push({
          id: `consecutive-high-${consecutiveHigh[0].id}`,
          type: 'warning',
          message: `${consecutiveHigh[0].targetMuscle}部位连续${consecutiveHigh.length}个高强度动作，建议穿插低强度动作或休息`,
          actionIds: consecutiveHigh.map((a) => a.id),
        });
      }
      consecutiveHigh = [];
    }
  }

  if (consecutiveHigh.length >= 2) {
    risks.push({
      id: `consecutive-high-${consecutiveHigh[0].id}`,
      type: 'warning',
      message: `${consecutiveHigh[0].targetMuscle}部位连续${consecutiveHigh.length}个高强度动作，建议穿插低强度动作或休息`,
      actionIds: consecutiveHigh.map((a) => a.id),
    });
  }

  return risks;
}

function checkMissingNotes(actions: WorkoutAction[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const missingNotesActions = actions.filter(
    (a) => !a.notes.trim() && a.status !== 'skip'
  );

  if (missingNotesActions.length > 0) {
    risks.push({
      id: 'missing-notes',
      type: 'warning',
      message: `${missingNotesActions.length}个动作缺少注意事项，建议补充以确保训练安全`,
      actionIds: missingNotesActions.map((a) => a.id),
    });
  }

  return risks;
}

function checkZeroSetsOrReps(actions: WorkoutAction[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const zeroActions = actions.filter(
    (a) => (a.sets <= 0 || a.reps <= 0) && a.status !== 'skip'
  );

  for (const action of zeroActions) {
    if (action.sets <= 0) {
      risks.push({
        id: `zero-sets-${action.id}`,
        type: 'error',
        message: `动作「${action.name}」组数为0，请检查`,
        actionIds: [action.id],
      });
    }
    if (action.reps <= 0) {
      risks.push({
        id: `zero-reps-${action.id}`,
        type: 'error',
        message: `动作「${action.name}」次数为0，请检查`,
        actionIds: [action.id],
      });
    }
  }

  return risks;
}

function checkDurationExceedPlan(
  actions: WorkoutAction[],
  plannedDuration: number
): RiskItem[] {
  const risks: RiskItem[] = [];
  const totalDuration = actions
    .filter((a) => a.status !== 'skip')
    .reduce((sum, a) => sum + a.sets * a.duration, 0);

  if (totalDuration > plannedDuration) {
    const exceed = totalDuration - plannedDuration;
    risks.push({
      id: 'duration-exceed',
      type: 'warning',
      message: `训练总时长（${totalDuration}分钟）超出计划时长（${plannedDuration}分钟）${exceed}分钟`,
      actionIds: actions.filter((a) => a.status !== 'skip').map((a) => a.id),
    });
  }

  return risks;
}

function checkSkippedCountedInDuration(actions: WorkoutAction[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const skippedActions = actions.filter((a) => a.status === 'skip');

  if (skippedActions.length > 0) {
    const skippedDuration = skippedActions.reduce(
      (sum, a) => sum + a.sets * a.duration,
      0
    );
    risks.push({
      id: 'skipped-counted',
      type: 'warning',
      message: `已跳过${skippedActions.length}个动作（共${skippedDuration}分钟），跳过后的动作仍会计入总时长统计`,
      actionIds: skippedActions.map((a) => a.id),
    });
  }

  return risks;
}

export function getRiskCountByType(
  risks: RiskItem[],
  type: 'warning' | 'error'
): number {
  return risks.filter((r) => r.type === type).length;
}
