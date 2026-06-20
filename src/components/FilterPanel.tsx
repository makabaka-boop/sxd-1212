import { X, Filter } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import {
  TARGET_MUSCLES,
  EQUIPMENTS,
  INTENSITY_OPTIONS,
  STATUS_OPTIONS,
} from '../types';

export function FilterPanel() {
  const { filters, setFilters, resetFilters } = useWorkoutStore();

  const toggleFilter = (type: string, value: string) => {
    const current = (filters as unknown as Record<string, string[]>)[type] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ [type]: newValues } as Partial<typeof filters>);
  };

  const hasActiveFiltersCount =
    filters.targetMuscle.length +
    filters.equipment.length +
    filters.intensity.length +
    filters.status.length +
    (filters.durationMin !== null ? 1 : 0) +
    (filters.durationMax !== null ? 1 : 0);

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 overflow-y-auto h-[calc(100vh-72px)] sticky top-[72px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-white">筛选条件</h2>
        </div>
        {hasActiveFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            重置
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="text-xs font-medium text-zinc-400 mb-2">目标部位</h3>
          <div className="flex flex-wrap gap-1.5">
            {TARGET_MUSCLES.map((muscle) => (
          <button
            key={muscle}
            onClick={() => toggleFilter('targetMuscle', muscle)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              filters.targetMuscle.includes(muscle)
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {muscle}
          </button>
        ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-zinc-400 mb-2">器械类型</h3>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENTS.map((equip) => (
              <button
                key={equip}
                onClick={() => toggleFilter('equipment', equip)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  filters.equipment.includes(equip)
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {equip}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-zinc-400 mb-2">训练强度</h3>
          <div className="flex flex-wrap gap-1.5">
            {INTENSITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleFilter('intensity', option.value)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  filters.intensity.includes(option.value)
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-zinc-400 mb-2">动作状态</h3>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleFilter('status', option.value)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  filters.status.includes(option.value)
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-zinc-400 mb-2">
          时长区间（分钟）
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="最短"
              value={filters.durationMin ?? ''}
              onChange={(e) =>
                setFilters({
                  durationMin: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:border-orange-500"
            />
            <span className="text-zinc-500 text-sm">至</span>
            <input
              type="number"
              min="0"
              placeholder="最长"
              value={filters.durationMax ?? ''}
              onChange={(e) =>
                setFilters({
                  durationMax: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
