import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ActionCard } from './ActionCard';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutAction } from '../types';
import { detectRisks } from '../utils/riskDetection';
import { filterActions } from '../utils/filterActions';

interface ActionListProps {
  onEditAction: (action: WorkoutAction) => void;
}

export function ActionList({ onEditAction }: ActionListProps) {
  const {
    actions,
    selectedIds,
    reorderActions,
    filters,
    plannedDuration,
  } = useWorkoutStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredActions = useMemo(() => {
    return filterActions(actions, filters).sort((a, b) => a.order - b.order);
  }, [actions, filters]);

  const riskActionIds = useMemo(() => {
    const risks = detectRisks(actions, plannedDuration);
    const ids = new Set<string>();
    risks.forEach((risk) => {
      risk.actionIds?.forEach((id) => ids.add(id));
    });
    return ids;
  }, [actions, plannedDuration]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderActions(String(active.id), String(over.id));
    }
  };

  if (filteredActions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🏋️</div>
          <h3 className="text-lg font-medium text-zinc-400 mb-2">
            暂无符合条件的动作
          </h3>
          <p className="text-sm text-zinc-500">
            尝试调整筛选条件，或添加新的训练动作
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredActions.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {filteredActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              isSelected={selectedIds.includes(action.id)}
              hasRisk={riskActionIds.has(action.id)}
              onEdit={onEditAction}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
