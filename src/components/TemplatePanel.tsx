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
  Search,
  Filter,
  ArrowUpDown,
  Replace,
  ListPlus,
  Layers,
  CheckCircle2,
  XCircle,
  Tag,
  Target,
  Zap,
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutTemplate, ApplyTemplateMode } from '../types';
import { TEMPLATE_CATEGORIES, INTENSITY_OPTIONS } from '../types';
import { calculateTotalDuration } from '../utils/timeCalculator';

interface TemplatePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortOption = 'lastUsed' | 'updatedAt' | 'createdAt' | 'usageCount';

export function TemplatePanel({ isOpen, onClose }: TemplatePanelProps) {
  const { templates, deleteTemplate } = useWorkoutStore();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState<WorkoutTemplate | null>(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('lastUsed');

  const filteredAndSortedTemplates = useMemo(() => {
    let result = [...templates];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(keyword) ||
          t.description.toLowerCase().includes(keyword) ||
          t.targetGoal.toLowerCase().includes(keyword) ||
          t.actions.some(
            (a) =>
              a.name.toLowerCase().includes(keyword) ||
              a.targetMuscle.toLowerCase().includes(keyword)
          )
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'lastUsed':
          return (b.lastUsedAt || 0) - (a.lastUsedAt || 0);
        case 'updatedAt':
          return b.updatedAt - a.updatedAt;
        case 'createdAt':
          return b.createdAt - a.createdAt;
        case 'usageCount':
          return b.usageCount - a.usageCount;
        default:
          return 0;
      }
    });

    return result;
  }, [templates, searchKeyword, selectedCategory, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    TEMPLATE_CATEGORIES.forEach((cat) => {
      counts[cat] = templates.filter((t) => t.category === cat).length;
    });
    return counts;
  }, [templates]);

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

  const formatRelativeTime = (timestamp: number | null) => {
    if (!timestamp) return '从未使用';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚使用';
    if (minutes < 60) return `${minutes}分钟前使用`;
    if (hours < 24) return `${hours}小时前使用`;
    if (days < 30) return `${days}天前使用`;
    return formatDate(timestamp);
  };

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'lastUsed', label: '最近使用', icon: <Clock className="w-3.5 h-3.5" /> },
    { value: 'updatedAt', label: '最近更新', icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    { value: 'createdAt', label: '创建时间', icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
    { value: 'usageCount', label: '使用次数', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">模板中心</h2>
              <p className="text-xs text-zinc-400">
                共 {templates.length} 个模板 · 筛选后 {filteredAndSortedTemplates.length} 个
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

        <div className="border-b border-zinc-800 p-4 space-y-3 flex-shrink-0 bg-zinc-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索模板名称、描述、目标、动作或部位..."
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-thin">
              <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                }`}
              >
                全部 ({categoryCounts.all})
              </button>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                  }`}
                >
                  {cat} ({categoryCounts[cat] || 0})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 border-r border-zinc-800 overflow-y-auto flex-shrink-0">
            {filteredAndSortedTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">
                  {templates.length === 0 ? '暂无模板' : '无匹配结果'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {templates.length === 0
                    ? '保存当前训练计划为模板，下次可快速套用'
                    : '尝试调整搜索关键词或分类筛选'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filteredAndSortedTemplates.map((template) => {
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
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded font-medium">
                              {template.category}
                            </span>
                            {template.usageCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-400 rounded">
                                ×{template.usageCount}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-white truncate">
                            {template.name}
                          </h3>
                          {template.targetGoal && (
                            <p className="text-xs text-orange-400/80 mt-0.5 truncate flex items-center gap-1">
                              <Target className="w-3 h-3 flex-shrink-0" />
                              {template.targetGoal}
                            </p>
                          )}
                          {template.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Dumbbell className="w-3 h-3" />
                              {template.actions.length}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {duration}min
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              {formatRelativeTime(template.lastUsedAt)}
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
                onApply={() => setShowApplyDialog(selectedTemplate)}
                onDelete={() => setShowDeleteConfirm(selectedTemplate.id)}
                formatDate={formatDate}
                formatRelativeTime={formatRelativeTime}
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
                  点击左侧模板列表查看动作明细并套用
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
                  <p className="text-xs text-zinc-400">删除后无法恢复</p>
                </div>
              </div>
              <p className="text-sm text-zinc-300 mb-4">确定要删除这个模板吗？</p>
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

        {showApplyDialog && (
          <ApplyTemplateDialog
            template={showApplyDialog}
            onClose={() => setShowApplyDialog(null)}
            onConfirmClose={() => {
              setShowApplyDialog(null);
              onClose();
            }}
          />
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
  formatRelativeTime: (timestamp: number | null) => string;
}

function TemplateDetail({
  template,
  onApply,
  onDelete,
  formatDate,
  formatRelativeTime,
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

  const muscleActionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    template.actions.forEach((a) => {
      counts[a.targetMuscle] = (counts[a.targetMuscle] || 0) + 1;
    });
    return counts;
  }, [template.actions]);

  return (
    <div className="p-5">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 bg-orange-500/15 text-orange-400 rounded-lg font-medium border border-orange-500/20">
                <Tag className="w-3 h-3 inline mr-1" />
                {template.category}
              </span>
              {template.usageCount > 0 && (
                <span className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-700">
                  已使用 {template.usageCount} 次
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
          </div>
        </div>

        {template.targetGoal && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-orange-300">
              <Target className="w-4 h-4" />
              <span className="font-medium">适用目标：</span>
              <span>{template.targetGoal}</span>
            </div>
          </div>
        )}

        {template.description && (
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{template.description}</p>
        )}

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{template.actions.length}</div>
            <div className="text-xs text-zinc-500 mt-1">动作数</div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{duration}</div>
            <div className="text-xs text-zinc-500 mt-1">分钟</div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{muscleGroups.length}</div>
            <div className="text-xs text-zinc-500 mt-1">部位</div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-violet-400">{template.usageCount}</div>
            <div className="text-xs text-zinc-500 mt-1">使用</div>
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

        {muscleGroups.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-zinc-500 mb-2">按部位分布</div>
            <div className="flex flex-wrap gap-1.5">
              {muscleGroups.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700"
                >
                  {m} × {muscleActionCounts[m]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-zinc-500 space-y-1 bg-zinc-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="w-16 text-zinc-600">创建时间</span>
            <span>{formatDate(template.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-zinc-600">更新时间</span>
            <span>{formatDate(template.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-zinc-600">上次使用</span>
            <span className={template.lastUsedAt ? 'text-orange-400' : ''}>
              {formatRelativeTime(template.lastUsedAt)}
            </span>
          </div>
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
                <span className="text-xs font-medium text-zinc-400">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{action.name}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                  <span>{action.targetMuscle}</span>
                  <span>·</span>
                  <span>{action.equipment}</span>
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
          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Play className="w-4 h-4" />
          应用模板
        </button>
      </div>
    </div>
  );
}

interface ApplyTemplateDialogProps {
  template: WorkoutTemplate;
  onClose: () => void;
  onConfirmClose: () => void;
}

function ApplyTemplateDialog({
  template,
  onClose,
  onConfirmClose,
}: ApplyTemplateDialogProps) {
  const { applyTemplate, actions: currentActions } = useWorkoutStore();
  const [mode, setMode] = useState<ApplyTemplateMode>('replace');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const templateMuscles = useMemo(() => {
    const muscles = new Set(template.actions.map((a) => a.targetMuscle));
    return Array.from(muscles);
  }, [template.actions]);

  const partialActionCount = useMemo(() => {
    if (mode !== 'partial' || selectedMuscles.length === 0) return 0;
    return template.actions.filter((a) => selectedMuscles.includes(a.targetMuscle)).length;
  }, [mode, selectedMuscles, template.actions]);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const handleConfirm = () => {
    if (mode === 'partial' && selectedMuscles.length === 0) {
      return;
    }
    applyTemplate(template.id, {
      mode,
      targetMuscles: mode === 'partial' ? selectedMuscles : undefined,
    });
    onConfirmClose();
  };

  const getPreviewText = () => {
    switch (mode) {
      case 'replace':
        return `将清空当前 ${currentActions.length} 个动作，替换为模板的 ${template.actions.length} 个动作`;
      case 'append':
        return `将在当前 ${currentActions.length} 个动作后，追加模板的 ${template.actions.length} 个动作`;
      case 'partial':
        if (selectedMuscles.length === 0) {
          return '请选择要导入的目标部位';
        }
        return `将在当前 ${currentActions.length} 个动作后，追加模板中 ${selectedMuscles.join('、')} 部位的 ${partialActionCount} 个动作`;
    }
  };

  const canConfirm = mode !== 'partial' || selectedMuscles.length > 0;

  const modes: {
    value: ApplyTemplateMode;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: 'replace',
      label: '整套覆盖',
      description: '清空当前计划，替换为模板全部内容',
      icon: <Replace className="w-5 h-5" />,
    },
    {
      value: 'append',
      label: '追加到当前',
      description: '保留现有动作，模板内容追加到末尾',
      icon: <ListPlus className="w-5 h-5" />,
    },
    {
      value: 'partial',
      label: '局部套用',
      description: '仅导入选中部位的动作',
      icon: <Layers className="w-5 h-5" />,
    },
  ];

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div>
            <h3 className="text-lg font-bold text-white">选择套用方式</h3>
            <p className="text-xs text-zinc-400 mt-0.5">模板：{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-2">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  mode === m.value
                    ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/30'
                    : 'bg-zinc-800/30 border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      mode === m.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          mode === m.value ? 'text-white' : 'text-zinc-200'
                        }`}
                      >
                        {m.label}
                      </span>
                      {mode === m.value && (
                        <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {mode === 'partial' && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">选择导入部位</div>
                <div className="text-xs text-zinc-500">
                  模板中共有 {templateMuscles.length} 个部位
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {templateMuscles.map((muscle) => {
                  const count = template.actions.filter(
                    (a) => a.targetMuscle === muscle
                  ).length;
                  const isSelected = selectedMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => toggleMuscle(muscle)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500'
                          : 'bg-zinc-900/50 border-zinc-700 hover:bg-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? 'text-white' : 'text-zinc-300'
                          }`}
                        >
                          {muscle}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {count}个动作
                        </span>
                      </div>
                      {isSelected && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-orange-400">
                          <CheckCircle2 className="w-3 h-3" />
                          已选中
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedMuscles.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
                  <span className="text-xs text-zinc-500">
                    已选择 {selectedMuscles.length} 个部位
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedMuscles([])}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    清空选择
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className={`rounded-xl p-4 border ${
              canConfirm
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-amber-500/5 border-amber-500/20'
            }`}
          >
            <div className="flex items-start gap-2">
              {canConfirm ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <div
                  className={`text-sm font-medium ${
                    canConfirm ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  套用预览
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    canConfirm ? 'text-emerald-400/80' : 'text-amber-400/80'
                  }`}
                >
                  {getPreviewText()}
                </p>
              </div>
            </div>
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
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:shadow-none"
            >
              <Play className="w-4 h-4" />
              确认套用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
