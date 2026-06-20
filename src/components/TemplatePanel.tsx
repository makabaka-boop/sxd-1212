import { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Play,
  Trash2,
  Clock,
  Dumbbell,
  ChevronRight,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutTemplate } from '../types';
import { calculateTotalDuration } from '../utils/timeCalculator';
import { INTENSITY_OPTIONS } from '../types';

interface TemplatePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatePanel({ isOpen, onClose }: TemplatePanelProps) {
  const { templates, applyTemplate, deleteTemplate } = useWorkoutStore();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [templates]);

  const handleApplyTemplate = (template: WorkoutTemplate) => {
    applyTemplate(template.id);
    onClose();
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setShowDeleteConfirm(null);
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">训练计划模板</h2>
              <p className="text-xs text-zinc-400">
                共 {templates.length} 个模板
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 border-r border-zinc-800 overflow-y-auto flex-shrink-0">
            {sortedTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">
                  暂无模板
                </h3>
                <p className="text-xs text-zinc-500">
                  保存当前训练计划为模板，下次可快速套用
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {sortedTemplates.map((template) => {
                  const duration = calculateTotalDuration(template.actions);
                  return (
                    <div
                      key={template.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'bg-orange-500/10 border-l-2 border-orange-500'
                          : 'hover:bg-zinc-800/50'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">
                            {template.name}
                          </h3>
                          {template.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Dumbbell className="w-3 h-3" />
                              {template.actions.length} 个动作
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {duration} 分钟
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedTemplate ? (
              <TemplateDetail
                template={selectedTemplate}
                onApply={() => handleApplyTemplate(selectedTemplate)}
                onDelete={() => setShowDeleteConfirm(selectedTemplate.id)}
                formatDate={formatDate}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">
                  选择一个模板查看详情
                </h3>
                <p className="text-xs text-zinc-500">
                  点击左侧模板列表查看动作明细
                </p>
              </div>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 max-w-sm mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">确认删除</h3>
                  <p className="text-xs text-zinc-400">
                    删除后无法恢复
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-300 mb-4">
                确定要删除这个模板吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteTemplate(showDeleteConfirm)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateDetailProps {
  template: WorkoutTemplate;
  onApply: () => void;
  onDelete: () => void;
  formatDate: (timestamp: number) => string;
}

function TemplateDetail({
  template,
  onApply,
  onDelete,
  formatDate,
}: TemplateDetailProps) {
  const duration = calculateTotalDuration(template.actions);
  const sortedActions = [...template.actions].sort((a, b) => a.order - b.order);

  const intensityCounts = useMemo(() => {
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0 };
    template.actions.forEach((a) => {
      counts[a.intensity] = (counts[a.intensity] || 0) + 1;
    });
    return counts;
  }, [template.actions]);

  const muscleGroups = useMemo(() => {
    const muscles = new Set(template.actions.map((a) => a.targetMuscle));
    return Array.from(muscles);
  }, [template.actions]);

  return (
    <div className="p-5">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
        {template.description && (
          <p className="text-sm text-zinc-400 mb-4">{template.description}</p>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {template.actions.length}
            </div>
            <div className="text-xs text-zinc-500 mt-1">动作数</div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{duration}</div>
            <div className="text-xs text-zinc-500 mt-1">分钟</div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {muscleGroups.length}
            </div>
            <div className="text-xs text-zinc-500 mt-1">部位</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {INTENSITY_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs text-center ${
                opt.value === 'low'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : opt.value === 'medium'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {opt.label} {intensityCounts[opt.value] || 0}
            </div>
          ))}
        </div>

        <div className="text-xs text-zinc-500 space-y-1">
          <div>创建时间：{formatDate(template.createdAt)}</div>
          <div>更新时间：{formatDate(template.updatedAt)}</div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-orange-400" />
          动作明细
        </h4>
        <div className="space-y-2">
          {sortedActions.map((action, index) => (
            <div
              key={action.id}
              className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-7 h-7 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-zinc-400">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {action.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                  <span>{action.targetMuscle}</span>
                  <span>·</span>
                  <span>
                    {action.sets}组 × {action.reps}次
                  </span>
                </div>
              </div>
              <div
                className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                  action.intensity === 'low'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : action.intensity === 'medium'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {INTENSITY_OPTIONS.find((i) => i.value === action.intensity)?.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 mt-5 pt-4 flex gap-3">
        <button
          onClick={onDelete}
          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          删除
        </button>
        <button
          onClick={onApply}
          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          应用模板
        </button>
      </div>
    </div>
  );
}
