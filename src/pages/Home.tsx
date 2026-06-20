import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { FilterPanel } from '../components/FilterPanel';
import { ActionList } from '../components/ActionList';
import { ActionForm } from '../components/ActionForm';
import { BatchToolbar } from '../components/BatchToolbar';
import { RiskAlert } from '../components/RiskAlert';
import { ExecutionMode } from '../components/ExecutionMode';
import { SaveTemplateDialog } from '../components/SaveTemplateDialog';
import { TemplatePanel } from '../components/TemplatePanel';
import { ProgressOverview } from '../components/ProgressOverview';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { filterActions } from '../utils/filterActions';
import type { WorkoutAction } from '../types';

export default function Home() {
  const { init, isExecutionMode, actions, filters } = useWorkoutStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<WorkoutAction | null>(
    null
  );
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);

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

  const filteredActions = useMemo(() => {
    return filterActions(actions, filters).sort((a, b) => a.order - b.order);
  }, [actions, filters]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header
        onAddAction={handleAddAction}
        onSaveTemplate={() => setIsSaveTemplateOpen(true)}
        onOpenTemplates={() => setIsTemplatePanelOpen(true)}
      />

      <div className="flex">
        <FilterPanel />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <ProgressOverview />
            </div>

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

      <SaveTemplateDialog
        isOpen={isSaveTemplateOpen}
        onClose={() => setIsSaveTemplateOpen(false)}
      />

      <TemplatePanel
        isOpen={isTemplatePanelOpen}
        onClose={() => setIsTemplatePanelOpen(false)}
      />

      {isExecutionMode && <ExecutionMode />}
    </div>
  );
}
