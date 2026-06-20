import { useState, useRef } from 'react';
import {
  Play,
  Download,
  Upload,
  Plus,
  Clock,
  Dumbbell,
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calculateTotalDuration, formatDurationShort } from '../utils/timeCalculator';
import { downloadJSON } from '../utils/storage';

interface HeaderProps {
  onAddAction: () => void;
}

export function Header({ onAddAction }: HeaderProps) {
  const { actions, plannedDuration, toggleExecutionMode, exportJSON } =
    useWorkoutStore();
  const [showImport, setShowImport] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const importJSON = useWorkoutStore((state) => state.importJSON);

  const totalDuration = calculateTotalDuration(actions);

  const handleExport = () => {
    const json = exportJSON();
    const date = new Date().toISOString().split('T')[0];
    downloadJSON(json, `workout-plan-${date}.json`);
  };

  const handleImportClick = () => {
    setShowImport(true);
    importInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importJSON(content);
        if (success) {
          alert('导入成功！');
        } else {
          alert('导入失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
    }
    setShowImport(false);
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">训练规划器</h1>
            <p className="text-xs text-zinc-400">科学规划，高效训练</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white font-mono">
                {formatDurationShort(totalDuration)}
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                总时长 / 计划 {formatDurationShort(plannedDuration)}
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-zinc-700" />

          <div className="flex items-center gap-2">
            <button
              onClick={onAddAction}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              添加动作
            </button>

            <button
              onClick={handleImportClick}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="导入JSON"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleExport}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="导出JSON"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={toggleExecutionMode}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm ml-2"
            >
              <Play className="w-4 h-4" />
              开始训练
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
