import { useState, useEffect, useMemo } from 'react';
import { Project, CalculatedProject } from '../types';
import { DEFAULT_PROJECTS } from '../constants';

export const useProjects = () => {
    // [High] localStorage の JSON.parse にエラーハンドリング追加
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            const saved = localStorage.getItem('apm_projects');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Failed to parse saved projects, resetting to defaults:', e);
            localStorage.removeItem('apm_projects');
        }
        return DEFAULT_PROJECTS;
    });

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showUsage, setShowUsage] = useState(false);
    const [userPersonality, setUserPersonality] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

    useEffect(() => {
        localStorage.setItem('apm_projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        const savedPersonality = localStorage.getItem('apm_personality');
        if (savedPersonality) setUserPersonality(savedPersonality);

        const hasSeen = localStorage.getItem('has_seen_guide');
        if (!hasSeen) {
            setShowUsage(true);
            localStorage.setItem('has_seen_guide', 'true');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('apm_personality', userPersonality);
    }, [userPersonality]);

    const calculateScores = (p: Project): CalculatedProject => {
        // Quick Win Index
        const qwi = (p.impact * 1.5) - (p.effort * 1.2) + (p.convexity * 0.5);
        // Long-term Investment Index
        const lii = (p.impact * 2.0) + (p.convexity * 1.5) - p.mentalDrain;
        // Mental Safety Index
        const msi = (p.excitement * 2.0) - (p.mentalDrain * 1.5) - (p.effort * 0.5);

        const priorityScore = (qwi * 0.4) + (lii * 0.4) + (msi * 0.2);

        return { ...p, qwi, lii, msi, priorityScore };
    };

    // [Medium] useMemo でスコア計算をキャッシュ（無関係な再レンダーで再計算しない）
    const orderedProjects = useMemo(() => projects.map(calculateScores), [projects]);

    const calculatedProjects = useMemo(
        () => [...orderedProjects].sort((a, b) => b.priorityScore - a.priorityScore),
        [orderedProjects]
    );

    const filteredProjects = useMemo(() => orderedProjects.filter(p => {
        if (filter === 'completed') return p.progress === 100;
        if (filter === 'in-progress') return p.progress < 100;
        return true;
    }), [orderedProjects, filter]);

    const reorderProjects = (startIndex: number, endIndex: number) => {
        const result = Array.from(projects);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        setProjects(result);
    };

    // [Critical] 保存前に計算フィールド（qwi, lii, msi, priorityScore）を除去
    const saveProject = (project: Project) => {
        if (!project.name) return;

        const { qwi, lii, msi, priorityScore, ...cleanProject } = project as CalculatedProject;

        if (cleanProject.id) {
            setProjects(prev => prev.map(p => p.id === cleanProject.id ? cleanProject : p));
        } else {
            setProjects(prev => [...prev, { ...cleanProject, id: crypto.randomUUID() }]);
        }
        setIsAdding(false);
        setEditingProject(null);
    };

    const deleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('このプロジェクトを削除しますか？')) {
            setProjects(prev => prev.filter(p => p.id !== id));
        }
    };

    const duplicateProject = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        const duplicated = {
            ...project,
            id: crypto.randomUUID(),
            name: `${project.name} (コピー)`
        };
        setProjects(prev => [...prev, duplicated]);
    };

    return {
        projects,
        setProjects,
        orderedProjects,
        calculatedProjects,
        filteredProjects,
        reorderProjects,
        saveProject,
        deleteProject,
        duplicateProject,
        editingProject,
        setEditingProject,
        isAdding,
        setIsAdding,
        filter,
        setFilter,
        userPersonality,
        setUserPersonality,
        showSettings,
        setShowSettings,
        showUsage,
        setShowUsage
    };
};
