import React from 'react';
import { Info, LucideProps } from 'lucide-react';
import { cn } from '../../utils';

interface SliderProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    icon: React.FC<LucideProps>;
    color: string;
    description: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, icon: Icon, color, description }) => {
    const inputId = `slider-${label.replace(/\s+/g, '-')}`;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={16} className={color} />
                    <label htmlFor={inputId} className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">{label}</label>
                    <div className="group relative">
                        <Info size={12} className="text-zinc-400 cursor-help" aria-hidden="true" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                            {description}
                        </div>
                    </div>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800", color)} aria-hidden="true">{value}</span>
            </div>
            <input
                id={inputId}
                type="range"
                min="1"
                max="10"
                step="1"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                aria-label={`${label}: ${value}`}
                aria-valuenow={value}
                aria-valuemin={1}
                aria-valuemax={10}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-800 dark:bg-zinc-700 dark:accent-white"
            />
        </div>
    );
};
