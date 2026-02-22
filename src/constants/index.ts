import { Project } from '../types';
import { Target, Brain, Zap, Sparkles, TrendingUp } from 'lucide-react';

export const AXES = [
    { key: 'impact', label: 'インパクト', icon: Target, color: 'text-blue-500', description: '人生・収益・影響力への波及' },
    { key: 'effort', label: '努力', icon: Brain, color: 'text-orange-500', description: '時間・学習コスト・実行負荷' },
    { key: 'mentalDrain', label: '精神摩耗', icon: Zap, color: 'text-red-500', description: 'ストレス・対人疲労・認知負荷' },
    { key: 'excitement', label: 'ワクワク度', icon: Sparkles, color: 'text-pink-500', description: '内発的動機・Childlike指数' },
    { key: 'convexity', label: '凸性', icon: TrendingUp, color: 'text-emerald-500', description: '小リスク大リターンの可能性' },
] as const;

export const PERSONALITY_PRESETS = [
    { label: 'バランス型', value: '好奇心旺盛だが、飽きっぽい。論理的な分析を好むが、最後は直感で決めるタイプ。' },
    { label: '分析・慎重型', value: 'データと論理を何より重視する。リスクを最小限に抑え、確実なリターンを狙うタイプ。' },
    { label: '直感・パッション型', value: 'ワクワクするかどうかだけで決める。モチベーションさえあれば多少の努力は苦にならないタイプ。' },
    { label: 'タイパ至上主義', value: 'とにかく無駄な時間と労力を使いたくない。最小の努力で最大の結果を求める超効率主義。' },
];

export const INITIAL_PROJECT: Project = {
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

export const DEFAULT_PROJECTS: Project[] = [
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
];
