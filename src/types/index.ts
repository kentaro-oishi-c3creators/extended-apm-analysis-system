export interface Project {
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

export interface CalculatedProject extends Project {
    qwi: number; // Quick Win Index
    lii: number; // Long-term Investment Index
    msi: number; // Mental Safety Index
    priorityScore: number;
}
