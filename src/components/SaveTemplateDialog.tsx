import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calculateTotalDuration } from '../utils/timeCalculator';

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveTemplateDialog({ isOpen, onClose }: SaveTemplateDialogProps) {
  const { actions, saveAsTemplate } = useWorkoutStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const totalDuration = calculateTotalDuration(actions);
  const actionCount = actions.length;

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveAsTemplate(name.trim(), description.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">保存为模板</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="text-sm text-zinc-400 mb-2">当前计划概览</div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-white">{actionCount}</div>
              <div className="text-sm text-zinc-400">个动作</div>
              <div className="w-px h-6 bg-zinc-700" />
              <div className="text-2xl font-bold text-orange-400">{totalDuration}</div>
              <div className="text-sm text-zinc-400">分钟</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              模板名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：胸部训练日、全身燃脂计划"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              模板描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述这个训练计划的特点、适用场景..."
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
              disabled={!name.trim()}
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存模板
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
