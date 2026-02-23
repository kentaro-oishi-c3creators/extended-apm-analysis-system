import { useState, useEffect } from 'react';
import { Project, CalculatedProject } from '../types';
import { DEFAULT_PROJECTS } from '../constants';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('apm_projects');
        return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
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

    const orderedProjects = projects.map(calculateScores);
    const calculatedProjects = [...orderedProjects].sort((a, b) => b.priorityScore - a.priorityScore);

    const filteredProjects = orderedProjects.filter(p => {
        if (filter === 'completed') return p.progress === 100;
        if (filter === 'in-progress') return p.progress < 100;
        return true;
    });

    const reorderProjects = (startIndex: number, endIndex: number) => {
        const result = Array.from(projects);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        setProjects(result);
    };

    const saveProject = (project: Project) => {
        if (!project.name) return;

        if (project.id) {
            setProjects(prev => prev.map(p => p.id === project.id ? project : p));
        } else {
            setProjects(prev => [...prev, { ...project, id: crypto.randomUUID() }]);
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
