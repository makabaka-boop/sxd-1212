import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Copy,
  Trash2,
  Edit3,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { WorkoutAction } from '../types';
import { INTENSITY_OPTIONS, STATUS_OPTIONS } from '../types';
import { calculateActionDuration, formatDurationShort } from '../utils/timeCalculator';
import { useWorkoutStore } from '../store/useWorkoutStore';

interface ActionCardProps {
  action: WorkoutAction;
  isSelected: boolean;
  hasRisk: boolean;
  onEdit: (action: WorkoutAction) => void;
}

export function ActionCard({ action, isSelected, hasRisk, onEdit }: ActionCardProps) {
  const { toggleSelect, duplicateAction, deleteAction, updateAction } =
    useWorkoutStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  const intensityInfo = INTENSITY_OPTIONS.find((i) => i.value === action.intensity);
  const statusInfo = STATUS_OPTIONS.find((s) => s.value === action.status);

  const totalDuration = calculateActionDuration(action);

  const intensityColorMap = {
    low: 'bg-emerald-900/50 text-emerald-400 border-emerald-700',
    medium: 'bg-amber-900/50 text-amber-400 border-amber-700',
    high: 'bg-red-900/50 text-red-400 border-red-700',
  };

  const statusColorMap = {
    pending: 'bg-zinc-700 text-zinc-300',
    completed: 'bg-emerald-900/50 text-emerald-400',
    reduce: 'bg-amber-900/50 text-amber-400',
    skip: 'bg-zinc-800 text-zinc-500 line-through',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-zinc-800/80 border rounded-xl p-4 transition-all cursor-pointer group ${
        isSelected
          ? 'border-orange-500 ring-2 ring-orange-500/30'
          : 'border-zinc-700 hover:border-zinc-600'
      } ${action.status === 'skip' ? 'opacity-60' : ''}`}
      onClick={() => toggleSelect(action.id)}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0 pr-28">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold text-white truncate ${
                    action.status === 'skip' ? 'line-through text-zinc-500' : ''
                  }`}
                >
                  {action.name}
                </h3>
                {hasRisk && (
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{action.targetMuscle}</span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span>{action.equipment}</span>
              </div>
            </div>

            <span
              className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                intensityColorMap[action.intensity]
              }`}
            >
              {intensityInfo?.label}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="text-orange-500 font-mono font-bold">
                {action.sets}
              </span>
              <span className="text-zinc-500">组</span>
              <span className="text-orange-500 font-mono font-bold">
                {action.reps}
              </span>
              <span className="text-zinc-500">次</span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{formatDurationShort(totalDuration)}</span>
            </div>

            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                statusColorMap[action.status]
              }`}
            >
              {statusInfo?.label}
            </span>
          </div>

          {action.notes && (
            <div className="mt-2 text-xs text-zinc-500 italic truncate">
              💡 {action.notes}
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(action)}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
          title="编辑"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => duplicateAction(action.id)}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
          title="复制"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteAction(action.id)}
          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-md transition-colors"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
