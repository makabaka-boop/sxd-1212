import { create } from 'zustand';
import type {
  WorkoutAction,
  FilterOptions,
  ActionStatus,
  WorkoutTemplate,
  WorkoutProgress,
  ApplyTemplateOptions,
  TemplateCategory,
} from '../types';
import { defaultActions } from '../data/defaultActions';
import {
  loadFromStorage,
  saveToStorage,
  loadPlanDuration,
  savePlanDuration,
  loadTemplatesFromStorage,
  saveTemplatesToStorage,
} from '../utils/storage';
import { calculateWorkoutProgress } from '../utils/progressCalculator';

interface WorkoutState {
  actions: WorkoutAction[];
  selectedIds: string[];
  filters: FilterOptions;
  plannedDuration: number;
  isExecutionMode: boolean;
  currentActionIndex: number;
  templates: WorkoutTemplate[];

  init: () => void;
  addAction: (action: Omit<WorkoutAction, 'id' | 'order'>) => void;
  updateAction: (id: string, updates: Partial<WorkoutAction>) => void;
  deleteAction: (id: string) => void;
  duplicateAction: (id: string) => void;
  reorderActions: (activeId: string, overId: string) => void;
  batchUpdateStatus: (ids: string[], status: ActionStatus) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  setPlannedDuration: (duration: number) => void;
  toggleExecutionMode: () => void;
  setCurrentActionIndex: (index: number) => void;
  nextAction: () => void;
  prevAction: () => void;
  updateCurrentActionStatus: (status: ActionStatus) => void;
  exportJSON: () => string;
  importJSON: (jsonString: string) => boolean;
  getFilteredActions: () => WorkoutAction[];
  saveAsTemplate: (
    name: string,
    description: string,
    category: TemplateCategory,
    targetGoal: string
  ) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (id: string, options: ApplyTemplateOptions) => void;
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => void;
  recordTemplateUsage: (id: string) => void;
  getWorkoutProgress: () => WorkoutProgress;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const initialFilters: FilterOptions = {
  targetMuscle: [],
  equipment: [],
  intensity: [],
  status: [],
  durationMin: null,
  durationMax: null,
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  actions: [],
  selectedIds: [],
  filters: initialFilters,
  plannedDuration: 60,
  isExecutionMode: false,
  currentActionIndex: 0,
  templates: [],

  init: () => {
    const storedActions = loadFromStorage();
    const storedDuration = loadPlanDuration();
    const storedTemplates = loadTemplatesFromStorage();
    if (storedActions !== null) {
      set({ actions: storedActions, plannedDuration: storedDuration, templates: storedTemplates });
    } else {
      set({ actions: defaultActions, plannedDuration: storedDuration, templates: storedTemplates });
      saveToStorage(defaultActions);
    }
  },

  addAction: (action) => {
    const { actions } = get();
    const newAction: WorkoutAction = {
      ...action,
      id: generateId(),
      order: actions.length,
    };
    const newActions = [...actions, newAction];
    set({ actions: newActions });
    saveToStorage(newActions);
  },

  updateAction: (id, updates) => {
    const { actions } = get();
    const newActions = actions.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    set({ actions: newActions });
    saveToStorage(newActions);
  },

  deleteAction: (id) => {
    const { actions, selectedIds } = get();
    const newActions = actions.filter((a) => a.id !== id);
    const reindexedActions = newActions.map((a, index) => ({
      ...a,
      order: index,
    }));
    const newSelectedIds = selectedIds.filter((sid) => sid !== id);
    set({ actions: reindexedActions, selectedIds: newSelectedIds });
    saveToStorage(reindexedActions);
  },

  duplicateAction: (id) => {
    const { actions } = get();
    const action = actions.find((a) => a.id === id);
    if (!action) return;

    const newAction: WorkoutAction = {
      ...action,
      id: generateId(),
      name: `${action.name} (副本)`,
      status: 'pending',
      order: actions.length,
    };
    const newActions = [...actions, newAction];
    set({ actions: newActions });
    saveToStorage(newActions);
  },

  reorderActions: (activeId, overId) => {
    const { actions } = get();
    const oldIndex = actions.findIndex((a) => a.id === activeId);
    const newIndex = actions.findIndex((a) => a.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newActions = [...actions];
    const [removed] = newActions.splice(oldIndex, 1);
    newActions.splice(newIndex, 0, removed);

    const reindexedActions = newActions.map((a, index) => ({
      ...a,
      order: index,
    }));
    set({ actions: reindexedActions });
    saveToStorage(reindexedActions);
  },

  batchUpdateStatus: (ids, status) => {
    const { actions } = get();
    const newActions = actions.map((a) =>
      ids.includes(a.id) ? { ...a, status } : a
    );
    set({ actions: newActions });
    saveToStorage(newActions);
  },

  toggleSelect: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  selectAll: (ids) => {
    set({ selectedIds: ids });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  setPlannedDuration: (duration) => {
    set({ plannedDuration: duration });
    savePlanDuration(duration);
  },

  toggleExecutionMode: () => {
    const { isExecutionMode, actions } = get();
    if (!isExecutionMode) {
      const firstPendingIndex = actions.findIndex((a) => a.status === 'pending');
      set({
        isExecutionMode: true,
        currentActionIndex: firstPendingIndex >= 0 ? firstPendingIndex : 0,
      });
    } else {
      set({ isExecutionMode: false });
    }
  },

  setCurrentActionIndex: (index) => {
    set({ currentActionIndex: index });
  },

  nextAction: () => {
    const { currentActionIndex, actions } = get();
    if (currentActionIndex < actions.length - 1) {
      set({ currentActionIndex: currentActionIndex + 1 });
    }
  },

  prevAction: () => {
    const { currentActionIndex } = get();
    if (currentActionIndex > 0) {
      set({ currentActionIndex: currentActionIndex - 1 });
    }
  },

  updateCurrentActionStatus: (status) => {
    const { actions, currentActionIndex } = get();
    const action = actions[currentActionIndex];
    if (!action) return;

    const newActions = actions.map((a, i) =>
      i === currentActionIndex ? { ...a, status } : a
    );
    set({ actions: newActions });
    saveToStorage(newActions);
  },

  exportJSON: () => {
    const { actions } = get();
    return JSON.stringify(actions, null, 2);
  },

  importJSON: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const reindexedActions = parsed.map((a, index) => ({
          ...a,
          order: index,
        }));
        set({
          actions: reindexedActions,
          selectedIds: [],
          filters: initialFilters,
          currentActionIndex: 0,
        });
        saveToStorage(reindexedActions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  getFilteredActions: () => {
    const { actions, filters } = get();
    return actions.filter((action) => {
      if (
        filters.targetMuscle.length > 0 &&
        !filters.targetMuscle.includes(action.targetMuscle)
      ) {
        return false;
      }
      if (
        filters.equipment.length > 0 &&
        !filters.equipment.includes(action.equipment)
      ) {
        return false;
      }
      if (
        filters.intensity.length > 0 &&
        !filters.intensity.includes(action.intensity)
      ) {
        return false;
      }
      if (
        filters.status.length > 0 &&
        !filters.status.includes(action.status)
      ) {
        return false;
      }
      const totalDuration = action.sets * action.duration;
      if (filters.durationMin !== null && totalDuration < filters.durationMin) {
        return false;
      }
      if (filters.durationMax !== null && totalDuration > filters.durationMax) {
        return false;
      }
      return true;
    });
  },

  saveAsTemplate: (name, description, category, targetGoal) => {
    const { actions, templates } = get();
    const now = Date.now();
    const newTemplate: WorkoutTemplate = {
      id: generateId(),
      name,
      description,
      category,
      targetGoal,
      actions: actions.map((a) => ({ ...a })),
      createdAt: now,
      updatedAt: now,
      lastUsedAt: null,
      usageCount: 0,
    };
    const newTemplates = [...templates, newTemplate];
    set({ templates: newTemplates });
    saveTemplatesToStorage(newTemplates);
  },

  deleteTemplate: (id) => {
    const { templates } = get();
    const newTemplates = templates.filter((t) => t.id !== id);
    set({ templates: newTemplates });
    saveTemplatesToStorage(newTemplates);
  },

  recordTemplateUsage: (id) => {
    const { templates } = get();
    const newTemplates = templates.map((t) =>
      t.id === id
        ? {
            ...t,
            lastUsedAt: Date.now(),
            usageCount: t.usageCount + 1,
            updatedAt: Date.now(),
          }
        : t
    );
    set({ templates: newTemplates });
    saveTemplatesToStorage(newTemplates);
  },

  applyTemplate: (id, options) => {
    const { templates, isExecutionMode } = get();
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    const { mode, targetMuscles = [] } = options;

    let filteredActions = template.actions;
    if (mode === 'partial' && targetMuscles.length > 0) {
      filteredActions = template.actions.filter((a) =>
        targetMuscles.includes(a.targetMuscle)
      );
    }

    if (filteredActions.length === 0) {
      return;
    }

    let newActions: WorkoutAction[] = [];
    const { actions: currentActions } = get();

    if (mode === 'replace') {
      newActions = filteredActions.map((action, index) => ({
        ...action,
        id: generateId(),
        status: 'pending' as ActionStatus,
        order: index,
      }));
    } else if (mode === 'append' || mode === 'partial') {
      const baseOrder = currentActions.length;
      const appendedActions = filteredActions.map((action, index) => ({
        ...action,
        id: generateId(),
        status: 'pending' as ActionStatus,
        order: baseOrder + index,
      }));
      newActions = [...currentActions, ...appendedActions];
    }

    if (isExecutionMode) {
      const { toggleExecutionMode } = get();
      toggleExecutionMode();
    }

    set({
      actions: newActions,
      selectedIds: [],
      currentActionIndex: 0,
      filters: initialFilters,
    });
    saveToStorage(newActions);

    const { recordTemplateUsage } = get();
    recordTemplateUsage(id);
  },

  updateTemplate: (id, updates) => {
    const { templates } = get();
    const newTemplates = templates.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    );
    set({ templates: newTemplates });
    saveTemplatesToStorage(newTemplates);
  },

  getWorkoutProgress: () => {
    const { actions } = get();
    return calculateWorkoutProgress(actions);
  },
}));
