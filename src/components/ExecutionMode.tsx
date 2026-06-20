import { useMemo, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  SkipForward,
  ArrowDownCircle,
  Clock,
  Dumbbell,
  Zap,
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { INTENSITY_OPTIONS, STATUS_OPTIONS } from '../types';
import type { ActionStatus } from '../types';
import {
  calculateActionDuration,
  formatDuration,
} from '../utils/timeCalculator';
import { calculateWorkoutProgress } from '../utils/progressCalculator';

export function ExecutionMode() {
  const {
    actions,
    currentActionIndex,
    toggleExecutionMode,
    nextAction,
    prevAction,
    setCurrentActionIndex,
    updateCurrentActionStatus,
  } = useWorkoutStore();

  const sortedActions = useMemo(
    () => [...actions].sort((a, b) => a.order - b.order),
    [actions]
  );

  const currentAction = sortedActions[currentActionIndex];
  const nextActionItem = sortedActions[currentActionIndex + 1];

  const progress = useMemo(
    () => calculateWorkoutProgress(actions),
    [actions]
  );

  const remainingDuration = progress.totalDuration - progress.completedDuration;
  const progressPercentage = progress.overallPercentage;

  const completedCount = progress.completedCount;
  const totalCount = progress.totalActions;

  const intensityInfo = currentAction
    ? INTENSITY_OPTIONS.find((i) => i.value === currentAction.intensity)
    : null;

  useEffect(() => {
    const hasPending = actions.some((a) => a.status === 'pending');
    if (!hasPending && currentActionIndex < actions.length) {
      const current = sortedActions[currentActionIndex];
      if (current && current.status !== 'pending') {
        setCurrentActionIndex(actions.length);
      }
    }
  }, [actions, currentActionIndex, sortedActions, setCurrentActionIndex]);

  const handleStatusUpdate = (status: ActionStatus) => {
    updateCurrentActionStatus(status);
    
    if (status !== 'reduce' && currentActionIndex < sortedActions.length - 1) {
      nextAction();
    }
  };

  const handleComplete = () => handleStatusUpdate('completed');
  const handleSkip = () => handleStatusUpdate('skip');

  const handleReduce = () => {
    updateCurrentActionStatus('reduce');
  };

  const intensityColorMap = {
    low: 'from-emerald-600 to-emerald-700',
    medium: 'from-amber-600 to-amber-700',
    high: 'from-red-600 to-red-700',
  };

  const statusColorMap = {
    pending: 'bg-zinc-600',
    completed: 'bg-emerald-600',
    reduce: 'bg-amber-600',
    skip: 'bg-zinc-700',
  };

  if (!currentAction) {
    return (
      <div className="fixed inset-0 bg-zinc-950 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">训练完成！</h2>
          <p className="text-zinc-400 mb-6">
            完成 {completedCount}/{totalCount} 个动作
          </p>
          <button
            onClick={toggleExecutionMode}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
          >
            返回规划
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <button
          onClick={toggleExecutionMode}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="text-sm text-zinc-400">
            动作 {currentActionIndex + 1} / {sortedActions.length}
          </div>
          <div className="text-lg font-bold text-white">
            {formatDuration(progress.completedDuration)} / {formatDuration(progress.totalDuration)}
          </div>
        </div>

        <div className="w-10" />
      </div>

      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            <div
              className={`bg-gradient-to-br ${
                intensityColorMap[currentAction.intensity]
              } rounded-3xl p-8 mb-6 shadow-2xl`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-white/70 text-sm mb-1">当前动作</div>
                  <h1 className="text-4xl font-bold text-white mb-3">
                    {currentAction.name}
                  </h1>
                  <div className="flex items-center gap-4 text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4" />
                      {currentAction.targetMuscle}
                    </span>
                    <span className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>{currentAction.equipment}</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                  {intensityInfo?.label}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white font-mono">
                    {currentAction.sets}
                  </div>
                  <div className="text-white/70 text-sm mt-1">组数</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white font-mono">
                    {currentAction.reps}
                  </div>
                  <div className="text-white/70 text-sm mt-1">次数</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white font-mono">
                    {calculateActionDuration(currentAction)}
                  </div>
                  <div className="text-white/70 text-sm mt-1">分钟</div>
                </div>
              </div>
            </div>

            {currentAction.notes && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">注意事项</span>
                </div>
                <p className="text-zinc-300">{currentAction.notes}</p>
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-medium">剩余时长</span>
              </div>
              <div className="text-5xl font-bold text-white font-mono mb-2">
                {formatDuration(remainingDuration)}
              </div>
              <div className="text-sm text-zinc-500">
                预计还需 {remainingDuration} 分钟完成全部训练
              </div>
            </div>
          </div>

          {nextActionItem && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-6">
              <div className="text-xs text-zinc-500 mb-2">下一个动作</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {nextActionItem.name}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {nextActionItem.targetMuscle} · {nextActionItem.sets}组{' '}
                      {nextActionItem.reps}次
                    </div>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    statusColorMap[nextActionItem.status]
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={prevAction}
              disabled={currentActionIndex === 0}
              className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-1.5">
              {sortedActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => setCurrentActionIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentActionIndex
                      ? 'bg-orange-500 w-6'
                      : statusColorMap[action.status]
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextAction}
              disabled={currentActionIndex >= sortedActions.length - 1}
              className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleReduce}
              className="flex flex-col items-center justify-center gap-1 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl transition-colors font-medium"
            >
              <ArrowDownCircle className="w-6 h-6" />
              <span className="text-sm">需降强度</span>
            </button>

            <button
              onClick={handleComplete}
              className="flex flex-col items-center justify-center gap-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-colors font-medium"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-sm">完成</span>
            </button>

            <button
              onClick={handleSkip}
              className="flex flex-col items-center justify-center gap-1 py-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-2xl transition-colors font-medium"
            >
              <SkipForward className="w-6 h-6" />
              <span className="text-sm">跳过</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
