import { X, CheckSquare, Square } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { STATUS_OPTIONS } from '../types';
import type { ActionStatus } from '../types';

export function BatchToolbar() {
  const {
    selectedIds,
    actions,
    batchUpdateStatus,
    clearSelection,
    selectAll,
    getFilteredActions,
  } = useWorkoutStore();

  const filteredActions = getFilteredActions().sort((a, b) => a.order - b.order);
  const filteredIds = filteredActions.map((a) => a.id);
  const allSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(filteredIds);
    }
  };

  const handleBatchStatus = (status: ActionStatus) => {
    if (selectedIds.length > 0) {
      batchUpdateStatus(selectedIds, status);
      clearSelection();
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-xl p-3 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-zinc-300 hover:text-white"
        >
          {allSelected ? (
            <CheckSquare className="w-5 h-5 text-orange-500" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            已选择 {selectedIds.length} 个动作
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 mr-1">批量标记：</span>
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleBatchStatus(option.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
          >
            {option.label}
          </button>
        ))}
        <button
          onClick={clearSelection}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors ml-2"
          title="取消选择"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
