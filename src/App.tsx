/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  ShieldCheck,
  Brain,
  Target,
  ChevronRight,
  Info,
  Sparkles,
  LayoutDashboard,
  ListFilter,
  BarChart3,
  Lightbulb,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Settings,
  FileText,
  Eye,
  Edit3,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
  LabelList,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Project {
  id: string;
  name: string;
  impact: number;
  effort: number;
  mentalDrain: number;
  excitement: number;
  convexity: number;
  minStep: string;
  comment: string;
  markdown: string;
  progress: number;
}

interface CalculatedProject extends Project {
  qwi: number; // Quick Win Index
  lii: number; // Long-term Investment Index
  msi: number; // Mental Safety Index
  priorityScore: number;
}

// --- Constants ---
const AXES = [
  { key: 'impact', label: 'インパクト', icon: Target, color: 'text-blue-500', description: '人生・収益・影響力への波及' },
  { key: 'effort', label: '努力', icon: Brain, color: 'text-orange-500', description: '時間・学習コスト・実行負荷' },
  { key: 'mentalDrain', label: '精神摩耗', icon: Zap, color: 'text-red-500', description: 'ストレス・対人疲労・認知負荷' },
  { key: 'excitement', label: 'ワクワク度', icon: Sparkles, color: 'text-pink-500', description: '内発的動機・Childlike指数' },
  { key: 'convexity', label: '凸性', icon: TrendingUp, color: 'text-emerald-500', description: '小リスク大リターンの可能性' },
] as const;

const PERSONALITY_PRESETS = [
  { label: 'バランス型', value: '好奇心旺盛だが、飽きっぽい。論理的な分析を好むが、最後は直感で決めるタイプ。' },
  { label: '分析・慎重型', value: 'データと論理を何より重視する。リスクを最小限に抑え、確実なリターンを狙うタイプ。' },
  { label: '直感・パッション型', value: 'ワクワクするかどうかだけで決める。モチベーションさえあれば多少の努力は苦にならないタイプ。' },
  { label: 'タイパ至上主義', value: 'とにかく無駄な時間と労力を使いたくない。最小の努力で最大の結果を求める超効率主義。' },
];

const INITIAL_PROJECT: Project = {
  id: '',
  name: '',
  impact: 5,
  effort: 5,
  mentalDrain: 5,
  excitement: 5,
  convexity: 5,
  minStep: '',
  comment: '',
  markdown: '',
  progress: 0,
};

// --- Components ---

interface SliderProps {
  key?: React.Key;
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: any;
  color: string;
  description: string;
}

const Slider = ({ label, value, onChange, icon: Icon, color, description }: SliderProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        <div className="group relative">
          <Info size={12} className="text-zinc-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {description}
          </div>
        </div>
      </div>
      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100", color)}>{value}</span>
    </div>
    <input
      type="range"
      min="1"
      max="10"
      step="1"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-800"
    />
  </div>
);

const UsageGuide = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "APM分析へようこそ",
      description: "APM（Action Priority Matrix）は、あなたの情熱（ワクワク）と科学（分析）を融合させ、次に何をすべきかを明確にするツールです。",
      icon: <Brain className="text-indigo-500 w-12 h-12" />,
      content: (
        <div className="space-y-4 text-sm text-zinc-600">
          <p>「やりたいことはあるけど、何から手をつければいいかわからない」</p>
          <p>そんな時は、アイデアを登録して5つの属性（インパクト、努力、ワクワク度など）を直感でスコアリングしてみてください。</p>
        </div>
      )
    },
    {
      title: "3つの重要指標",
      description: "入力されたデータから、独自のアルゴリズムで3つの「勝ち筋」を算出します。",
      icon: <BarChart3 className="text-emerald-500 w-12 h-12" />,
      content: (
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
            <span className="font-bold text-emerald-700 block mb-1">QWI (Quick Win Index)</span>
            少ない努力で大きな成果が出る「今すぐやるべき」効率性指標です。
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs">
            <span className="font-bold text-blue-700 block mb-1">LII (Long-term Investment)</span>
            将来の大きな資産になる「コツコツ育てるべき」資産価値指標です。
          </div>
          <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-xs">
            <span className="font-bold text-pink-700 block mb-1">MSI (Mental Safety Index)</span>
            あなたの心が疲れないか、ワクワクが勝っているかを示す継続性指標です。
          </div>
        </div>
      )
    },
    {
      title: "AIとの最強タッグ",
      description: "このアプリはオフラインで動きますが、外部のAI（ChatGPT Plusなど）と組み合わせることで真価を発揮します。",
      icon: <Sparkles className="text-amber-500 w-12 h-12" />,
      content: (
        <div className="space-y-4 text-sm text-zinc-600">
          <p>ヘッダーの「AI連携プロンプトを生成」ボタンを押すと、あなたの全データとパーソナリティを盛り込んだ最強の指示書がコピーされます。</p>
          <p>それをAIに貼り付けるだけで、世界トップクラスのコンサルタントによる個別アドバイスが受けられます。</p>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden shadow-indigo-500/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-center">{steps[step].icon}</div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-900">{steps[step].title}</h2>
                <p className="text-sm text-zinc-500 leading-relaxed px-4">{steps[step].description}</p>
              </div>
              <div className="bg-zinc-50 p-6 rounded-2xl min-h-[180px] flex flex-col justify-center">
                {steps[step].content}
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        step === i ? "w-6 bg-zinc-900" : "bg-zinc-200"
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  {step > 0 && (
                    <button
                      onClick={() => setStep(s => s - 1)}
                      className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      戻る
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (step < steps.length - 1) {
                        setStep(s => s + 1);
                      } else {
                        onClose();
                      }
                    }}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-900/20"
                  >
                    {step < steps.length - 1 ? "次へ" : "分析をはじめる"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('apm_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved projects", e);
      }
    }
    return [
      {
        id: '1',
        name: 'AIコンサルティング副業',
        impact: 9,
        effort: 6,
        mentalDrain: 4,
        excitement: 8,
        convexity: 9,
        minStep: 'ChatGPTを使って競合のサービス内容を3つ書き出す',
        comment: 'まずは週末の3時間から開始する。',
        markdown: '### AIコンサルティング計画\n- ターゲット: 中小企業の経営者\n- 提供価値: 業務効率化の自動化提案',
        progress: 20
      },
      {
        id: '2',
        name: '毎日15分の読書習慣',
        impact: 5,
        effort: 2,
        mentalDrain: 1,
        excitement: 6,
        convexity: 4,
        minStep: 'Kindleを開いて最初の1ページだけ読む',
        comment: '寝る前のルーティンに組み込む。',
        markdown: '### 読書リスト\n1. 影響力の武器\n2. 予想どおりに不合理',
        progress: 80
      },
      {
        id: '3',
        name: '新規SaaS開発プロジェクト',
        impact: 10,
        effort: 9,
        mentalDrain: 8,
        excitement: 9,
        convexity: 10,
        minStep: 'ランディングページのワイヤーフレームを紙に書く',
        comment: '長期的な資産。',
        markdown: '### SaaS構想\n- 課題: タスク管理の煩雑さ\n- 解決策: 感情ベースの優先順位付け',
        progress: 5
      },
      {
        id: '4',
        name: '不要な会議への出席',
        impact: 2,
        effort: 8,
        mentalDrain: 9,
        excitement: 1,
        convexity: 1,
        minStep: '来週の予定から優先度の低い会議を1つキャンセルする',
        comment: '断る勇気が必要。',
        markdown: '### 会議の断り方テンプレート\n"その時間は集中作業に充てさせていただきたく..." ',
        progress: 0
      }
    ]
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingMd, setIsExportingMd] = useState(false);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [userPersonality, setUserPersonality] = useState(PERSONALITY_PRESETS[0].value);
  const [overallAdvice, setOverallAdvice] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isCopied, setIsCopied] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const hasSeen = localStorage.getItem('has_seen_guide');
    if (!hasSeen) {
      setShowUsage(true);
      localStorage.setItem('has_seen_guide', 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apm_projects', JSON.stringify(projects));
  }, [projects]);

  // --- Logic ---
  const suggestStep = async () => {
    if (!editingProject?.name) return;
    setIsGenerating(true);
    try {
      // Rule-based simulation of AI minimal step suggestion
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading

      const verbs = ["スケジュールにブロックする", "ノートに1行書き出す", "関連する過去の資料を探す", "詳しい人にメッセージを送る", "5分だけ関連リサーチをする"];
      const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];

      const text = `「${editingProject.name}」について、まずは${randomVerb}。`;
      setEditingProject(prev => prev ? { ...prev, minStep: text } : null);
    } catch (error) {
      console.error("Failed to generate step:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculatedProjects = useMemo(() => {
    return projects.map(p => {
      const qwi = (p.impact * p.excitement * p.convexity) / (p.effort + p.mentalDrain);
      const lii = (p.impact * p.convexity) / p.effort;
      const msi = p.excitement / p.mentalDrain;

      // Overall priority score for ranking
      const priorityScore = (qwi * 0.5) + (lii * 0.3) + (msi * 0.2);

      return { ...p, qwi, lii, msi, priorityScore };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    switch (filterMode) {
      case 'active': return projects.filter(p => p.progress < 100);
      case 'completed': return projects.filter(p => p.progress >= 100);
      default: return projects;
    }
  }, [projects, filterMode]);

  const recommendations = useMemo(() => {
    if (calculatedProjects.length === 0) return null;

    const sortedByQWI = [...calculatedProjects].sort((a, b) => b.qwi - a.qwi);
    const sortedByLII = [...calculatedProjects].sort((a, b) => b.lii - a.lii);
    const sortedByEffort = [...calculatedProjects].sort((a, b) => b.effort - a.effort);

    return {
      startNow: calculatedProjects[0], // Top overall
      quickWin: sortedByQWI[0],
      longTerm: sortedByLII[0],
      discard: sortedByEffort.find(p => p.impact < 4 && p.effort > 7) || sortedByEffort[0],
    };
  }, [calculatedProjects]);

  const handleSave = (project: Project) => {
    if (project.id) {
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    } else {
      setProjects(prev => [...prev, { ...project, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setEditingProject(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('すべてのアイデアを削除してもよろしいですか？')) {
      setProjects([]);
      localStorage.removeItem('apm_projects');
    }
  };

  const exportToAiMarkdown = async () => {
    if (projects.length === 0) return;
    setIsExportingMd(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate loading

      // Generate a structured markdown report locally without AI
      const topQWI = [...calculatedProjects].sort((a, b) => b.qwi - a.qwi)[0];
      const topLII = [...calculatedProjects].sort((a, b) => b.lii - a.lii)[0];

      const mdContent = `# 戦略的APM分析レポート\n\n` +
        `## 1. エグゼクティブサマリー\n` +
        `現在、${projects.length}個のプロジェクトが進行中です。パーソナリティ（${userPersonality}）を考慮すると、短期的にはモチベーションを維持しやすく、長期的には大きなインパクトを残すバランスの取れた行動計画が必要です。\n\n` +
        `## 2. 優先順位ハイライト\n` +
        `- **クイックウィン (QWIスコアトップ)**: ${topQWI ? topQWI.name : 'なし'} — すぐに着手して勢いをつけるべき案件です。\n` +
        `- **長期投資 (LIIスコアトップ)**: ${topLII ? topLII.name : 'なし'} — 将来の大きな資産となるため、少しずつでも進めるべき案件です。\n\n` +
        `## 3. アクションプラン\n` +
        `まずは「${topQWI?.name}」の最小ステップ（${topQWI?.minStep || '未設定'}）から取り掛かりましょう。\n\n` +
        `> **Keep Touching Childlike?**\n` +
        `> ワクワクする気持ちを忘れずに進められていますか？`;

      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `apm_strategic_report_${new Date().toISOString().split('T')[0]}.md`);
      link.click();
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("レポート生成に失敗しました。");
    } finally {
      setIsExportingMd(false);
    }
  };

  const generateOverallAdvice = async () => {
    if (projects.length === 0) return;
    setIsGeneratingAdvice(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading

      const topProjects = [...calculatedProjects].slice(0, 3);
      const lowMsiProject = calculatedProjects.find(p => p.msi < 0.5);

      let advice = `### 現在の全体的な状態\n\n`;
      advice += `全体的に非常にアクティブな状態です。特トップ優先度である**「${topProjects[0]?.name}」**に注力すると最も費用対効果が高いでしょう。\n\n`;

      if (lowMsiProject) {
        advice += `⚠️ **注意:** 「${lowMsiProject.name}」は精神的な負荷が高いため（MSI低下）、思い切って捨てるか、やり方を大きく変えることを推奨します。\n\n`;
      }

      advice += `あなたの特性（${userPersonality}）を活かすため、飽きる前に「ワクワク度が一番高いタスク」だけで今日のスケジュールを埋める日を作ってみてはいかがでしょうか？`;

      setOverallAdvice(advice);
    } catch (error) {
      console.error("Failed to generate advice:", error);
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  // --- Data Management ---
  const exportToJson = () => {
    const data = {
      projects,
      userPersonality,
      overallAdvice
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `apm_analysis_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCsv = () => {
    const headers = ['id', 'name', 'impact', 'effort', 'mentalDrain', 'excitement', 'convexity', 'minStep', 'comment', 'markdown', 'progress'];
    const csvRows = [
      headers.join(','),
      ...projects.map(p => headers.map(h => {
        const val = p[h as keyof Project];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
    ];
    const csvStr = csvRows.join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `apm_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const importedProjects: Project[] = lines.slice(1).filter(line => line.trim()).map(line => {
        // Simple CSV parser that handles quotes
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const p: any = {};
        headers.forEach((h, i) => {
          const val = values[i]?.replace(/^"|"$/g, '').replace(/""/g, '"');
          if (['impact', 'effort', 'mentalDrain', 'excitement', 'convexity', 'progress'].includes(h)) {
            p[h] = parseInt(val) || 0;
          } else {
            p[h] = val || '';
          }
        });

        if (!p.id) p.id = Math.random().toString(36).substr(2, 9);
        return p as Project;
      });

      if (importedProjects.length > 0) {
        setProjects(prev => [...prev, ...importedProjects]);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const copyPromptForAI = async () => {
    const promptText = `あなたは世界トップクラスの戦略コンサルタント兼、行動科学の専門家です。
以下の私のパーソナリティと、「APM（Action Priority Matrix）分析」にかけた私のプロジェクトリストを読み込み、具体的な行動計画と戦略的アドバイスを提示してください。

【私のパーソナリティ】
${userPersonality}

【プロジェクトデータ（QWI=クイックウィン指数, LII=長期投資指数, MSI=精神安全指数）】
${JSON.stringify(
      calculatedProjects.map(p => ({
        名前: p.name,
        インパクト: p.impact,
        努力: p.effort,
        ワクワク度: p.excitement,
        凸性: p.convexity,
        精神摩耗: p.mentalDrain,
        QWI: p.qwi.toFixed(2),
        LII: p.lii.toFixed(2),
        MSI: p.msi.toFixed(2),
        進捗: p.progress + '%',
        現在の最小ステップ: p.minStep,
      })), null, 2
    )}

【指示内容】
1. このデータから読み取れる、私の現在の「強み」と「ボトルネック」を指摘してください。
2. パーソナリティを考慮し、今日から1週間以内に私がとるべき最優先アクションを3つに絞って提案してください。
3. MSI（精神安全指数）が低いタスクがある場合、それをどう処理すべきか（捨てる・人に振る・仕組みを変える等）アドバイスしてください。
4. 最後に、モチベーションを劇的に高める問いかけで締めくくってください。`;

    try {
      await navigator.clipboard.writeText(promptText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("クリップボードへのコピーに失敗しました。");
    }
  };

  // --- Settings UI --- 
  const renderSettings = () => (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Settings size={16} />
                分析設定
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase">あなたのパーソナリティ（AI分析用）</label>

                {/* Presets */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {PERSONALITY_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserPersonality(preset.value)}
                      className={cn(
                        "text-xs px-3 py-2 rounded-lg border text-left transition-all",
                        userPersonality === preset.value
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={userPersonality}
                  onChange={(e) => setUserPersonality(e.target.value)}
                  className="w-full text-sm border-2 border-zinc-200 rounded-xl p-3 h-24 focus:outline-none focus:border-zinc-900 transition-colors"
                  placeholder="あなたの性格、強み、弱み、モチベーションの源泉などを入力..."
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">拡張APM分析システム</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyPromptForAI}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all shadow-sm active:scale-95"
            >
              <Brain size={16} />
              {isCopied ? "コピーしました！" : "AI連携プロンプトを生成"}
            </button>

            <button
              onClick={() => setShowUsage(true)}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors flex items-center gap-2 group"
              title="使い方ガイド"
            >
              <HelpCircle size={18} className="group-hover:text-zinc-900" />
              <span className="text-xs font-bold hidden md:inline group-hover:text-zinc-900">使い方</span>
            </button>

            <div className="w-px h-6 bg-zinc-200 mx-1"></div>

            <div className="flex items-center bg-zinc-100 rounded-lg p-1 mr-2">
              <button
                onClick={exportToCsv}
                title="CSVエクスポート"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-zinc-600 transition-all"
              >
                <FileSpreadsheet size={16} />
              </button>
              <button
                onClick={exportToJson}
                title="JSONエクスポート"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-zinc-600 transition-all"
              >
                <FileJson size={16} />
              </button>
              <button
                onClick={exportToAiMarkdown}
                disabled={isExportingMd}
                title="AI戦略レポート(MD)出力"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-zinc-600 transition-all disabled:opacity-50"
              >
                <FileText size={16} className={cn(isExportingMd && "animate-pulse")} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                title="AI設定"
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-zinc-600 transition-all"
              >
                <Settings size={16} />
              </button>
              <label className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-zinc-600 transition-all cursor-pointer">
                <Upload size={16} />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCsv}
                  className="hidden"
                />
              </label>
            </div>
            <button
              onClick={() => {
                setEditingProject({ ...INITIAL_PROJECT });
                setIsAdding(true);
              }}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              <Plus size={16} />
              新規アイデア追加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: List & Input */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2 text-zinc-500">
                <ListFilter size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">アイデア一覧</span>
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-lg">
                {(['all', 'active', 'completed'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase tracking-wider",
                      filterMode === mode ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    {mode === 'all' ? '全て' : mode === 'active' ? '進行中' : '完了'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-400">{filteredProjects.length} PROJECTS</span>
                {projects.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                  >
                    一括削除
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-zinc-200">
                    <Lightbulb size={32} className="text-zinc-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-900">アイデアを登録しましょう</p>
                    <p className="text-xs text-zinc-400 px-4">
                      まず、気になっている副業案やプロジェクトを「新規アイデア追加」から1つ追加してみましょう！
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProject({ ...INITIAL_PROJECT });
                      setIsAdding(true);
                    }}
                    className="mt-2 text-xs font-bold bg-zinc-900 text-white px-6 py-2 rounded-full hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                  >
                    最初のアイデアを追加
                  </button>
                </div>
              ) : (
                filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 hover:bg-zinc-50 transition-colors group cursor-pointer"
                    onClick={() => setEditingProject(p)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold group-hover:text-zinc-900 transition-colors">{p.name}</h3>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">IMP: {p.impact}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded font-bold">EFF: {p.effort}</span>
                          <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden w-16">
                            <div
                              className="h-full bg-zinc-400 transition-all"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400">{p.progress}%</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Overall Advice Section */}
          {calculatedProjects.length > 0 && (
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Brain size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">全体行動指針</span>
                </div>
                <button
                  onClick={generateOverallAdvice}
                  disabled={isGeneratingAdvice}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Sparkles size={12} className={cn(isGeneratingAdvice && "animate-pulse")} />
                  {isGeneratingAdvice ? '分析中...' : 'AIに相談'}
                </button>
              </div>
              <div className="p-6">
                {overallAdvice ? (
                  <div className="prose prose-zinc prose-sm max-w-none">
                    <Markdown>{overallAdvice}</Markdown>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-zinc-400">
                      あなたのパーソナリティと現在のプロジェクト状況から、最適な行動指針をAIが提案します。
                    </p>
                    <button
                      onClick={generateOverallAdvice}
                      className="text-xs font-bold text-zinc-900 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-50 transition-colors"
                    >
                      分析を開始する
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Recommendations Summary */}
          {calculatedProjects.length > 0 && recommendations && (
            <section className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest">戦略的推奨アクション</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">まず着手すべき1つ</p>
                  <p className="text-sm font-medium">{recommendations.startNow.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">今月のクイックウィン</p>
                  <p className="text-sm font-medium">{recommendations.quickWin.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">育てるべき長期案件</p>
                  <p className="text-sm font-medium">{recommendations.longTerm.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">捨てる候補</p>
                  <p className="text-sm font-medium text-zinc-400 line-through decoration-red-500/50">{recommendations.discard.name}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs italic text-zinc-400 leading-relaxed">
                  「最小着手ステップ：{recommendations.startNow.minStep || '未設定'}」
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Analysis & Visualization */}
        <div className="lg:col-span-8 space-y-8">

          {/* Matrix Chart */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={18} className="text-zinc-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest">4象限マトリクス (インパクト × 努力)</h2>
              </div>
            </div>

            <div className="h-[400px] w-full relative">
              {/* Quadrant Labels - Standardized centering */}
              <div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-zinc-300 uppercase pointer-events-none text-center">
                Strategic<br /><span className="text-[10px] opacity-50 font-normal">(High Impact, High Effort)</span>
              </div>
              <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-zinc-300 uppercase pointer-events-none text-center">
                Quick Wins<br /><span className="text-[10px] opacity-50 font-normal">(High Impact, Low Effort)</span>
              </div>
              <div className="absolute top-[75%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-zinc-300 uppercase pointer-events-none text-center">
                Fill-ins<br /><span className="text-[10px] opacity-50 font-normal">(Low Impact, Low Effort)</span>
              </div>
              <div className="absolute top-[75%] left-[75%] -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-zinc-300 uppercase pointer-events-none text-center">
                Thankless Tasks<br /><span className="text-[10px] opacity-50 font-normal">(Low Impact, High Effort)</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    dataKey="effort"
                    name="努力"
                    domain={[0, 10]}
                    tick={{ fontSize: 10 }}
                    label={{ value: '努力 (Effort)', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="impact"
                    name="インパクト"
                    domain={[0, 10]}
                    tick={{ fontSize: 10 }}
                    label={{ value: 'インパクト (Impact)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fontWeight: 'bold' }}
                  />
                  <ZAxis type="number" dataKey="priorityScore" range={[100, 1000]} />
                  <ReferenceLine x={5} stroke="#e5e7eb" strokeWidth={2} />
                  <ReferenceLine y={5} stroke="#e5e7eb" strokeWidth={2} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl border border-zinc-800 text-xs space-y-1">
                            <p className="font-bold border-b border-zinc-800 pb-1 mb-1">{data.name}</p>
                            <p>インパクト: {data.impact}</p>
                            <p>努力: {data.effort}</p>
                            <p className="text-yellow-400 font-bold">QWI: {data.qwi.toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Projects" data={calculatedProjects}>
                    {calculatedProjects.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.qwi > 5 ? '#10b981' : entry.lii > 5 ? '#3b82f6' : '#94a3b8'}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setEditingProject(entry)}
                      />
                    ))}
                    <LabelList dataKey="name" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#71717a', pointerEvents: 'none' }} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Radar Chart Analysis */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="p-6 md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Target size={18} className="text-pink-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest">属性バランス分析</h2>
              </div>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                全プロジェクトの平均的な傾向をレーダーチャートで可視化します。特定の属性に偏りがないか確認し、戦略的なポートフォリオのバランスを調整しましょう。
              </p>
            </div>
            <div className="h-[300px] md:w-1/2 relative p-4 bg-white">
              {calculatedProjects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                    { subject: 'インパクト', value: calculatedProjects.reduce((sum, p) => sum + p.impact, 0) / calculatedProjects.length, fullMark: 10 },
                    { subject: 'ワクワク度', value: calculatedProjects.reduce((sum, p) => sum + p.excitement, 0) / calculatedProjects.length, fullMark: 10 },
                    { subject: '凸性', value: calculatedProjects.reduce((sum, p) => sum + p.convexity, 0) / calculatedProjects.length, fullMark: 10 },
                    { subject: '精神摩耗', value: calculatedProjects.reduce((sum, p) => sum + p.mentalDrain, 0) / calculatedProjects.length, fullMark: 10 },
                    { subject: '努力', value: calculatedProjects.reduce((sum, p) => sum + p.effort, 0) / calculatedProjects.length, fullMark: 10 }
                  ]}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#a1a1aa', fontSize: 8 }} />
                    <Radar name="Average Profile" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">データがありません</div>
              )}
            </div>
          </section>

          {/* Detailed Table */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2 text-zinc-500">
                <BarChart3 size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">詳細スコア分析</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase">プロジェクト名</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase text-center">
                      <div className="flex items-center justify-center gap-1 group relative">
                        QWI (Quick)
                        <Info size={10} className="text-zinc-300 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal normal-case">
                          すぐに成果が出る「今すぐやるべき」効率性指標。努力が少なく、インパクトが大きいほど高くなります。
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase text-center">
                      <div className="flex items-center justify-center gap-1 group relative">
                        LII (Long)
                        <Info size={10} className="text-zinc-300 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal normal-case">
                          将来の大きな資産になる「コツコツ育てるべき」資産価値指標。凸性（小リスク大リターン）を重視します。
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase text-center">
                      <div className="flex items-center justify-center gap-1 group relative">
                        MSI (Safety)
                        <Info size={10} className="text-zinc-300 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal normal-case">
                          あなたの心が疲れないかを示す継続性指標。ワクワク度が摩耗を上回ると高くなります。
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase text-right">総合スコア</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {calculatedProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                          <p className="text-[10px] text-zinc-400 italic truncate max-w-[200px]">{p.minStep || 'ステップ未設定'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "text-xs font-mono font-bold px-2 py-1 rounded",
                          p.qwi > 10 ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                        )}>
                          {p.qwi.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "text-xs font-mono font-bold px-2 py-1 rounded",
                          p.lii > 10 ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600"
                        )}>
                          {p.lii.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "text-xs font-mono font-bold px-2 py-1 rounded",
                          p.msi > 2 ? "bg-pink-100 text-pink-700" : "bg-zinc-100 text-zinc-600"
                        )}>
                          {p.msi.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-zinc-900">{p.priorityScore.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Childlike Prompt */}
          <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight">Keep Touching Childlike?</h2>
              <p className="text-indigo-100 max-w-md mx-auto text-sm leading-relaxed">
                戦略は重要ですが、あなたの「内なる子供」がそのプロジェクトにワクワクしているか、それが持続可能性の鍵です。
              </p>
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold tracking-widest uppercase">
                  <Sparkles size={14} className="text-yellow-300" />
                  Stay Curious, Stay Foolish
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Edit Modal Component */}
      {renderSettings()}
      <UsageGuide isOpen={showUsage} onClose={() => setShowUsage(false)} />
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingProject(null);
                setIsAdding(false);
              }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 pb-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold tracking-tight">
                  {isAdding ? '新規アイデアの登録' : 'アイデアの編集'}
                </h2>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsAdding(false);
                  }}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <ChevronRight size={20} className="rotate-90" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-8 pt-6 space-y-8 overflow-y-auto flex-1">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">プロジェクト名</label>
                    <input
                      type="text"
                      value={editingProject.name}
                      onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                      placeholder="例: AIコンサルティング副業"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {AXES.map((axis) => {
                      const val = editingProject[axis.key as keyof Project];
                      return (
                        <Slider
                          key={axis.key}
                          label={axis.label}
                          icon={axis.icon}
                          color={axis.color}
                          description={axis.description}
                          value={typeof val === 'number' ? val : 5}
                          onChange={(newVal) => setEditingProject({ ...editingProject, [axis.key]: newVal })}
                        />
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">最小着手ステップ (30分以内)</label>
                      <button
                        onClick={suggestStep}
                        disabled={isGenerating || !editingProject.name}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                      >
                        <Sparkles size={12} className={cn(isGenerating && "animate-pulse")} />
                        {isGenerating ? '生成中...' : 'AIで提案'}
                      </button>
                    </div>
                    <textarea
                      value={editingProject.minStep}
                      onChange={(e) => setEditingProject({ ...editingProject, minStep: e.target.value })}
                      placeholder="例: 競合他社のWebサイトを3つリサーチする"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm font-medium h-24 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">進捗状況 ({editingProject.progress}%)</label>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={editingProject.progress}
                      onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-800"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                      <span>未着手</span>
                      <span>進行中</span>
                      <span>完了</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">コメント・メモ</label>
                    <textarea
                      value={editingProject.comment}
                      onChange={(e) => setEditingProject({ ...editingProject, comment: e.target.value })}
                      placeholder="例: このプロジェクトは来月から本格始動する予定。"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm font-medium h-24 resize-none"
                    />
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-6">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">詳細ドキュメント (Markdown)</label>
                      <div className="flex bg-zinc-100 p-1 rounded-lg">
                        <button
                          onClick={() => setActiveTab('edit')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                            activeTab === 'edit' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                          )}
                        >
                          <Edit3 size={12} />
                          編集
                        </button>
                        <button
                          onClick={() => setActiveTab('preview')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                            activeTab === 'preview' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                          )}
                        >
                          <Eye size={12} />
                          プレビュー
                        </button>
                      </div>
                    </div>

                    {activeTab === 'edit' ? (
                      <textarea
                        value={editingProject.markdown}
                        onChange={(e) => setEditingProject({ ...editingProject, markdown: e.target.value })}
                        placeholder="プロジェクトの詳細な背景、リサーチ結果、マインドマップなどをMarkdown形式で記述してください。"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm font-medium h-64 resize-none font-mono"
                      />
                    ) : (
                      <div className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-xl min-h-[16rem] prose prose-zinc prose-sm max-w-none overflow-y-auto">
                        <Markdown>{editingProject.markdown || "*ドキュメントが空です*"}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 pt-4 border-t border-zinc-100 flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsAdding(false);
                  }}
                  className="flex-1 px-6 py-3 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleSave(editingProject)}
                  disabled={!editingProject.name}
                  className="flex-1 px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存して分析
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
