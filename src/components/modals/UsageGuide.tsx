import React, { useState } from 'react';
import { Brain, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils';

interface UsageGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UsageGuide: React.FC<UsageGuideProps> = ({ isOpen, onClose }) => {
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
