import { useState, useEffect, useMemo } from 'react';
import { X, Save, Tag, Target } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calculateTotalDuration } from '../utils/timeCalculator';
import { TEMPLATE_CATEGORIES, type TemplateCategory } from '../types';

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveTemplateDialog({ isOpen, onClose }: SaveTemplateDialogProps) {
  const { actions, saveAsTemplate } = useWorkoutStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('综合');
  const [targetGoal, setTargetGoal] = useState('');

  const totalDuration = calculateTotalDuration(actions);
  const actionCount = actions.length;

  const musclesInPlan = useMemo(() => {
    const muscles = new Set(actions.map((a) => a.targetMuscle));
    return Array.from(muscles);
  }, [actions]);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setCategory('综合');
      setTargetGoal('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveAsTemplate(name.trim(), description.trim(), category, targetGoal.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-lg font-bold text-white">保存为模板</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="text-sm text-zinc-400 mb-3">当前计划概览</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{actionCount}</div>
                <div className="text-xs text-zinc-500 mt-0.5">个动作</div>
              </div>
              <div className="w-px bg-zinc-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{totalDuration}</div>
                <div className="text-xs text-zinc-500 mt-0.5">分钟</div>
              </div>
            </div>
            {musclesInPlan.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-700/50">
                <div className="text-xs text-zinc-500 mb-2">涉及部位</div>
                <div className="flex flex-wrap gap-1.5">
                  {musclesInPlan.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-zinc-500" />
              模板分类 <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-zinc-500" />
              适用目标说明
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="例如：适合初级训练者、增肌期使用、产后恢复等"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              模板描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述这个训练计划的特点、训练频率、注意事项..."
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
