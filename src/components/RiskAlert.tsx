import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  XCircle,
  ChevronUp,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { detectRisks, getRiskCountByType } from '../utils/riskDetection';

export function RiskAlert() {
  const { actions, plannedDuration, setPlannedDuration } = useWorkoutStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlanInput, setShowPlanInput] = useState(false);

  const risks = useMemo(
    () => detectRisks(actions, plannedDuration),
    [actions, plannedDuration]
  );

  const warningCount = getRiskCountByType(risks, 'warning');
  const errorCount = getRiskCountByType(risks, 'error');

  const hasRisks = risks.length > 0;

  if (!hasRisks && !isExpanded) {
    return (
      <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-400">训练计划状态良好</span>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/50 rounded-md transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {errorCount > 0 ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          )}
          <div>
            <span className="text-sm font-medium text-white">
              发现 {risks.length} 个风险提醒
            </span>
            <div className="flex items-center gap-3 mt-0.5">
              {errorCount > 0 && (
                <span className="text-xs text-red-400">
                  {errorCount} 个错误
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-xs text-amber-400">
                  {warningCount} 个警告
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPlanInput(!showPlanInput);
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
            title="设置计划时长"
          >
            <Settings className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-800 p-3 space-y-2">
          {showPlanInput && (
            <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg mb-2">
              <span className="text-xs text-zinc-400 whitespace-nowrap">
                计划时长：
              </span>
              <input
                type="number"
                min="0"
                value={plannedDuration}
                onChange={(e) =>
                  setPlannedDuration(Math.max(0, Number(e.target.value)))
                }
                className="w-20 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <span className="text-xs text-zinc-400">分钟</span>
            </div>
          )}

          {risks.map((risk) => (
            <div
              key={risk.id}
              className={`flex items-start gap-2 p-2.5 rounded-lg ${
                risk.type === 'error'
                  ? 'bg-red-900/20 border border-red-800/50'
                  : 'bg-amber-900/20 border border-amber-800/50'
              }`}
            >
              {risk.type === 'error' ? (
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm text-zinc-200">{risk.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
