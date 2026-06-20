import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { WorkoutAction, Intensity } from '../types';
import {
  TARGET_MUSCLES,
  EQUIPMENTS,
  INTENSITY_OPTIONS,
} from '../types';
import { useWorkoutStore } from '../store/useWorkoutStore';

interface ActionFormProps {
  action: WorkoutAction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActionForm({ action, isOpen, onClose }: ActionFormProps) {
  const { addAction, updateAction } = useWorkoutStore();
  const [formData, setFormData] = useState({
    name: '',
    targetMuscle: '胸部',
    equipment: '哑铃',
    sets: 3,
    reps: 12,
    intensity: 'medium' as Intensity,
    duration: 3,
    notes: '',
  });

  useEffect(() => {
    if (action) {
      setFormData({
        name: action.name,
        targetMuscle: action.targetMuscle,
        equipment: action.equipment,
        sets: action.sets,
        reps: action.reps,
        intensity: action.intensity,
        duration: action.duration,
        notes: action.notes,
      });
    } else {
      setFormData({
        name: '',
        targetMuscle: '胸部',
        equipment: '哑铃',
        sets: 3,
        reps: 12,
        intensity: 'medium' as Intensity,
        duration: 3,
        notes: '',
      });
    }
  }, [action, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (action) {
      updateAction(action.id, formData);
    } else {
      addAction({
        ...formData,
        status: 'pending',
      });
    }
    onClose();
  };

  const handleChange = (
    field: string,
    value: string | number | Intensity
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">
            {action ? '编辑动作' : '添加动作'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              动作名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="例如：平板卧推"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                目标部位
              </label>
              <select
                value={formData.targetMuscle}
                onChange={(e) => handleChange('targetMuscle', e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                {TARGET_MUSCLES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                器械
              </label>
              <select
                value={formData.equipment}
                onChange={(e) => handleChange('equipment', e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                {EQUIPMENTS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                组数
              </label>
              <input
                type="number"
                min="0"
                value={formData.sets}
                onChange={(e) =>
                  handleChange('sets', Math.max(0, Number(e.target.value)))
                }
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                次数
              </label>
              <input
                type="number"
                min="0"
                value={formData.reps}
                onChange={(e) =>
                  handleChange('reps', Math.max(0, Number(e.target.value)))
                }
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                单组时长(分)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.duration}
                onChange={(e) =>
                  handleChange(
                    'duration',
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              训练强度
            </label>
            <div className="flex gap-2">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('intensity', opt.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.intensity === opt.value
                      ? opt.value === 'low'
                        ? 'bg-emerald-600 text-white'
                        : opt.value === 'medium'
                        ? 'bg-amber-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              注意事项
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="动作要点、安全提示等..."
              rows={3}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              {action ? '保存修改' : '添加动作'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
