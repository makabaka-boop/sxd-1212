import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FilterPanel } from '../components/FilterPanel';
import { ActionList } from '../components/ActionList';
import { ActionForm } from '../components/ActionForm';
import { BatchToolbar } from '../components/BatchToolbar';
import { RiskAlert } from '../components/RiskAlert';
import { ExecutionMode } from '../components/ExecutionMode';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutAction } from '../types';

export default function Home() {
  const { init, isExecutionMode, getFilteredActions } = useWorkoutStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<WorkoutAction | null>(
    null
  );

  useEffect(() => {
    init();
  }, [init]);

  const handleAddAction = () => {
    setEditingAction(null);
    setIsFormOpen(true);
  };

  const handleEditAction = (action: WorkoutAction) => {
    setEditingAction(action);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAction(null);
  };

  const filteredActions = getFilteredActions().sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header onAddAction={handleAddAction} />

      <div className="flex">
        <FilterPanel />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <RiskAlert />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">训练动作</h2>
                <p className="text-sm text-zinc-400">
                  共 {filteredActions.length} 个动作 · 拖拽调整顺序
                </p>
              </div>
            </div>

            <BatchToolbar />

            <ActionList onEditAction={handleEditAction} />
          </div>
        </main>
      </div>

      <ActionForm
        action={editingAction}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />

      {isExecutionMode && <ExecutionMode />}
    </div>
  );
}
