import { create } from 'zustand';
import type {
  WorkoutAction,
  FilterOptions,
  ActionStatus,
  Intensity,
} from '../types';
import { defaultActions } from '../data/defaultActions';
import {
  loadFromStorage,
  saveToStorage,
  loadPlanDuration,
  savePlanDuration,
} from '../utils/storage';

interface WorkoutState {
  actions: WorkoutAction[];
  selectedIds: string[];
  filters: FilterOptions;
  plannedDuration: number;
  isExecutionMode: boolean;
  currentActionIndex: number;

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

  init: () => {
    const storedActions = loadFromStorage();
    const storedDuration = loadPlanDuration();
    if (storedActions && storedActions.length > 0) {
      set({ actions: storedActions, plannedDuration: storedDuration });
    } else {
      set({ actions: defaultActions, plannedDuration: storedDuration });
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
        set({ actions: reindexedActions, selectedIds: [] });
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
}));
