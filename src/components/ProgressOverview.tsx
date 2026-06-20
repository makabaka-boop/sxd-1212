import { useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  SkipForward,
  ArrowDownCircle,
  Dumbbell,
  TrendingUp,
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calculateWorkoutProgress } from '../utils/progressCalculator';
import { formatDuration, formatDurationShort } from '../utils/timeCalculator';

export function ProgressOverview() {
  const actions = useWorkoutStore((state) => state.actions);
  const plannedDuration = useWorkoutStore((state) => state.plannedDuration);

  const progress = useMemo(
    () => calculateWorkoutProgress(actions),
    [actions]
  );

  const planVsActualDiff = plannedDuration - progress.totalDuration;

  if (progress.totalActions === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">训练完成度概览</h3>
            <p className="text-xs text-zinc-500">
              基于当前训练动作列表实时统计
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-400">
            {progress.overallPercentage}%
          </div>
          <div className="text-xs text-zinc-500">整体完成度</div>
        </div>
      </div>

      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
          style={{ width: `${progress.overallPercentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400">总训练时长</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatDurationShort(progress.totalDuration)}
          </div>
          {plannedDuration > 0 && (
            <div
              className={`text-xs mt-0.5 ${
                planVsActualDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {planVsActualDiff >= 0
                ? `计划 ${plannedDuration}min · 剩余 ${formatDurationShort(planVsActualDiff)}`
                : `计划 ${plannedDuration}min · 超出 ${formatDurationShort(Math.abs(planVsActualDiff))}`}
            </div>
          )}
        </div>

        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400">已完成</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {progress.completedCount}
            <span className="text-xs text-emerald-500 ml-1 font-normal">
              / {progress.totalActions}
            </span>
          </div>
          <div className="text-xs text-emerald-500/80 mt-0.5">
            {formatDurationShort(progress.completedDuration)}
          </div>
        </div>

        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Circle className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400">待训练</span>
          </div>
          <div className="text-lg font-bold text-white">
            {progress.pendingCount}
            <span className="text-xs text-zinc-500 ml-1 font-normal">
              / {progress.totalActions}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {progress.pendingCount > 0
              ? `占比 ${Math.round((progress.pendingCount / progress.totalActions) * 100)}%`
              : '全部安排完毕'}
          </div>
        </div>

        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex -space-x-1">
              <SkipForward className="w-3.5 h-3.5 text-zinc-400" />
              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-xs text-zinc-400">跳过/降强度</span>
          </div>
          <div className="text-lg font-bold text-white">
            <span className="text-zinc-400">{progress.skipCount}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-amber-400">{progress.reduceCount}</span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {progress.skipCount + progress.reduceCount > 0
              ? `合计 ${progress.skipCount + progress.reduceCount} 个调整`
              : '无调整动作'}
          </div>
        </div>
      </div>

      {progress.muscleProgress.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Dumbbell className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">
              按目标肌群汇总进度
            </span>
          </div>
          <div className="space-y-2.5">
            {progress.muscleProgress.map((mp) => (
              <div key={mp.muscle}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-200 font-medium">
                      {mp.muscle}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {mp.completed}/{mp.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {mp.skip > 0 && (
                      <span className="text-xs text-zinc-500">
                        跳过 {mp.skip}
                      </span>
                    )}
                    {mp.reduce > 0 && (
                      <span className="text-xs text-amber-400">
                        降强 {mp.reduce}
                      </span>
                    )}
                    <span className="text-sm font-bold text-orange-400 w-10 text-right">
                      {mp.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      mp.percentage === 100
                        ? 'bg-emerald-500'
                        : mp.percentage > 50
                        ? 'bg-orange-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${mp.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
