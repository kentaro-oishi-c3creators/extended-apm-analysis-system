const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importsToAdd = `
import { cn, downloadFile } from './utils';
import { Project, CalculatedProject } from './types';
import { AXES, PERSONALITY_PRESETS, INITIAL_PROJECT } from './constants';
import { Slider } from './components/ui/Slider';
import { UsageGuide } from './components/modals/UsageGuide';
import { SettingsModal } from './components/modals/SettingsModal';
import { useProjects } from './hooks/useProjects';
`;

const utilStart = code.indexOf('// --- Utility ---');
const appStart = code.indexOf('export default function App() {');

if (utilStart !== -1 && appStart !== -1) {
    code = code.substring(0, utilStart) + importsToAdd + '\n\n' + code.substring(appStart);
}

const renderSettingsRegex = /const renderSettings = \(\) => \([\s\S]*?<\/AnimatePresence>\s*\);/;
code = code.replace(renderSettingsRegex, '');

code = code.replace(/{renderSettings\(\)}/, '<SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} userPersonality={userPersonality} setUserPersonality={setUserPersonality} />');

const hookCall = `  const {
    projects, setProjects,
    calculatedProjects, filteredProjects,
    editingProject, setEditingProject,
    isAdding, setIsAdding,
    filter, setFilter,
    userPersonality, setUserPersonality,
    showSettings, setShowSettings,
    showUsage, setShowUsage
  } = useProjects();
  
  const filterMode = filter;
  const setFilterMode = setFilter;
`;

const stateRegex = /const \[projects, setProjects\][\s\S]*?const \[filterMode, setFilterMode\] = useState<'all' \| 'active' \| 'completed'>\('all'\);/;
code = code.replace(stateRegex, hookCall);

code = code.replace(/useEffect\(\(\) => {\s*const hasSeen = localStorage.getItem\('has_seen_guide'\);[\s\S]*?}, \[\]\);/, '');
code = code.replace(/useEffect\(\(\) => {\s*localStorage.setItem\('apm_projects', JSON.stringify\(projects\)\);\s*}, \[projects\]\);/, '');

code = code.replace(/const calculatedProjects = useMemo\(\(\) => {[\s\S]*?}, \[projects\]\);/, '');
code = code.replace(/const filteredProjects = useMemo\(\(\) => {[\s\S]*?}, \[projects, filterMode\]\);/, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Refactoring script finished.");
