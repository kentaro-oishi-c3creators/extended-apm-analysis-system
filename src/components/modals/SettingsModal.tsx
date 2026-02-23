import React from 'react';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils';
import { PERSONALITY_PRESETS } from '../../constants';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userPersonality: string;
    setUserPersonality: (personality: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    userPersonality,
    setUserPersonality
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-transparent dark:border-zinc-800"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                <Settings size={16} />
                                分析設定
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">あなたのパーソナリティ（AI分析用）</label>

                                {/* Presets */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {PERSONALITY_PRESETS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setUserPersonality(preset.value)}
                                            className={cn(
                                                "text-xs px-3 py-2 rounded-lg border text-left transition-all",
                                                userPersonality === preset.value
                                                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={userPersonality}
                                    onChange={(e) => setUserPersonality(e.target.value)}
                                    className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 h-24 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                    placeholder="あなたの性格、強み、弱み、モチベーションの源泉などを入力..."
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
