
import React, { useState, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import type { Scenario, Skill } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { INITIAL_SCENARIOS } from './constants';
import { PencilIcon, PlusIcon, SparklesIcon, TrashIcon } from './components/icons';
import SkillFormModal from './components/SkillFormModal';
import ConfirmationDialog from './components/ConfirmationDialog';
import AIAssistantModal from './components/AIAssistantModal';
import AIScenarioAssistantModal from './components/AIScenarioAssistantModal';

// Helper component defined outside App to prevent re-renders
const SkillCard: React.FC<{ skill: Skill; onEdit: () => void; onDelete: () => void; }> = ({ skill, onEdit, onDelete }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg transition-transform hover:scale-105 hover:border-yellow-500/50">
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-yellow-400 font-serif truncate" title={skill.name}>{skill.name}</h3>
          {skill.origin && <span className="text-xs font-semibold bg-gray-600 text-gray-200 px-2 py-0.5 rounded-full">{skill.origin}</span>}
        </div>
        {skill.manaCost && (
          <p className="text-xs text-cyan-300 font-mono mt-1">Custo: {skill.manaCost}</p>
        )}
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <button onClick={onEdit} className="text-gray-400 hover:text-yellow-400 transition" aria-label={`Editar ${skill.name}`}>
          <PencilIcon className="w-5 h-5" />
        </button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition" aria-label={`Apagar ${skill.name}`}>
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
    <p className="text-gray-300 mt-2">{skill.description}</p>
  </div>
);

function App() {
  const [scenarios, setScenarios] = useLocalStorage<Scenario[]>('rpg-skills-t20', INITIAL_SCENARIOS);
  // Initialize activeScenarioId directly from the stored scenarios
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(scenarios[0]?.id ?? null);
  
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isScenarioAssistantOpen, setIsScenarioAssistantOpen] = useState(false);
  
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const [newScenarioName, setNewScenarioName] = useState('');

  const activeScenario = useMemo(() => scenarios.find(s => s.id === activeScenarioId), [scenarios, activeScenarioId]);

  const handleAddSkill = (skillData: Omit<Skill, 'id'>) => {
    if (!activeScenarioId) return;
    const newSkill: Skill = { ...skillData, id: Date.now().toString() };
    const updatedScenarios = scenarios.map(s =>
      s.id === activeScenarioId
        ? { ...s, skills: [...s.skills, newSkill] }
        : s
    );
    setScenarios(updatedScenarios);
    toast.success(`Poder "${newSkill.name}" adicionado!`);
  };

  const handleUpdateSkill = (skillData: Omit<Skill, 'id'>) => {
    if (!skillToEdit || !activeScenarioId) return;
    const updatedScenarios = scenarios.map(s =>
      s.id === activeScenarioId
        ? { ...s, skills: s.skills.map(skill => skill.id === skillToEdit.id ? { ...skillToEdit, ...skillData } : skill) }
        : s
    );
    setScenarios(updatedScenarios);
    setSkillToEdit(null);
    toast.success(`Poder "${skillData.name}" atualizado!`);
  };

  const handleSkillFormSubmit = (skillData: Omit<Skill, 'id'>) => {
    if (skillToEdit) {
      handleUpdateSkill(skillData);
    } else {
      handleAddSkill(skillData);
    }
  };

  const openEditModal = (skill: Skill) => {
    setSkillToEdit(skill);
    setIsSkillFormOpen(true);
  };

  const openAddModal = () => {
    setSkillToEdit(null);
    setIsSkillFormOpen(true);
  }

  const handleDeleteSkill = (skillId: string) => {
    if (!activeScenarioId) return;
    const skillToDelete = activeScenario.skills.find(s => s.id === skillId);
    if (!skillToDelete) return;

    setDialogConfig({
      title: `Apagar "${skillToDelete.name}"?`,
      description: 'Tem certeza que deseja apagar este poder? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        const updatedScenarios = scenarios.map(s =>
          s.id === activeScenarioId
            ? { ...s, skills: s.skills.filter(skill => skill.id !== skillId) }
            : s
        );
        setScenarios(updatedScenarios);
        toast.success(`Poder "${skillToDelete.name}" apagado.`);
      }
    });
  };

  const addNewScenario = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName === "") return;

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: trimmedName,
      skills: []
    };
    const newScenarios = [...scenarios, newScenario];
    setScenarios(newScenarios);
    setActiveScenarioId(newScenario.id);
    toast.success(`Cenário "${trimmedName}" criado!`);

    if (scenarios.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast.error(`O cenário "${trimmedName}" já existe.`);
        return;
    }
  };

  const handleAddScenarioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNewScenario(newScenarioName);
    setNewScenarioName('');
  };
  
  const handleDeleteScenario = (scenarioIdToDelete: string) => {
    const scenarioToDelete = scenarios.find(s => s.id === scenarioIdToDelete);
    if (!scenarioToDelete) return;
    
    setDialogConfig({
      title: `Apagar o cenário "${scenarioToDelete.name}"?`,
      description: 'Todos os poderes associados a este cenário serão perdidos. Esta ação não pode ser desfeita.',
      onConfirm: () => {
        const remainingScenarios = scenarios.filter(s => s.id !== scenarioIdToDelete);
        if (activeScenarioId === scenarioIdToDelete) {
            const originalIndex = scenarios.findIndex(s => s.id === scenarioIdToDelete);
            if (remainingScenarios.length === 0) {
                setActiveScenarioId(null);
            } else {
                const newIndex = Math.min(originalIndex, remainingScenarios.length - 1);
                setActiveScenarioId(remainingScenarios[newIndex].id);
            }
        }
        setScenarios(remainingScenarios);
        toast.success(`Cenário "${scenarioToDelete.name}" apagado.`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
      <Toaster richColors theme="dark" position="bottom-right" />
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 font-serif">Manual de Combate e Ações T20</h1>
          <p className="text-gray-400 mt-2">Organize suas ações e poderes de Tormenta 20 para cada situação de combate.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Scenarios Sidebar */}
          <aside className="lg:col-span-1 bg-gray-800/50 p-4 rounded-lg border border-gray-700 self-start">
            <h2 className="text-xl font-bold mb-4 text-yellow-300 font-serif">Cenários</h2>
            <button
              onClick={() => setIsScenarioAssistantOpen(true)}
              className="w-full flex items-center justify-center gap-2 mb-4 py-2 px-3 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition shadow-md text-sm"
            >
              <SparklesIcon className="w-5 h-5" />
              Sugerir Cenários com IA
            </button>
            <div className="flex flex-col space-y-2 mb-4">
              {scenarios.map(scenario => (
                <div key={scenario.id} className="flex items-center group">
                  <button
                    onClick={() => setActiveScenarioId(scenario.id)}
                    className={`text-left w-full p-3 rounded-l-md transition-all duration-200 text-sm font-medium ${
                      activeScenarioId === scenario.id
                        ? 'bg-yellow-500 text-gray-900 shadow-lg'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    {scenario.name}
                  </button>
                  <button 
                    onClick={() => handleDeleteScenario(scenario.id)}
                    className={`p-3 transition-all duration-200 rounded-r-md ${
                        activeScenarioId === scenario.id
                          ? 'bg-yellow-500/80 hover:bg-yellow-400 text-gray-900'
                          : 'bg-gray-700 text-gray-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100'
                    }`}
                    aria-label={`Apagar cenário ${scenario.name}`}
                  >
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddScenarioSubmit}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newScenarioName}
                        onChange={(e) => setNewScenarioName(e.target.value)}
                        placeholder="Nome do novo cenário"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-sm"
                    />
                    <button 
                        type="submit"
                        disabled={!newScenarioName.trim()}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-md text-gray-900 font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                        aria-label="Adicionar novo cenário"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
          </aside>

          {/* Skills Display */}
          <section className="lg:col-span-3">
            {activeScenario ? (
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 min-h-[60vh]">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 font-serif">{activeScenario.name}</h2>
                  <div className="flex gap-2 sm:gap-4">
                    <button
                      onClick={() => setIsAIAssistantOpen(true)}
                      className="flex items-center py-2 px-3 sm:px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition shadow-md"
                      >
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">Sugerir com IA</span>
                      <span className="inline sm:hidden">IA</span>
                    </button>
                    <button
                      onClick={openAddModal}
                      className="flex items-center py-2 px-3 sm:px-4 bg-yellow-500 hover:bg-yellow-600 rounded-md text-gray-900 font-semibold transition shadow-md"
                      >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">Adicionar Poder</span>
                      <span className="inline sm:hidden">Add</span>
                    </button>
                  </div>
                </div>

                {activeScenario.skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeScenario.skills.map(skill => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        onEdit={() => openEditModal(skill)}
                        onDelete={() => handleDeleteSkill(skill.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-400">Nenhum poder adicionado para este cenário.</p>
                    <p className="text-gray-500 mt-1">Clique em "Adicionar Poder" para começar.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center bg-gray-800/50 p-6 rounded-lg border border-gray-700 min-h-[60vh]">
                {scenarios.length > 0 ? (
                    <p className="text-gray-400">Selecione um cenário para ver os poderes.</p>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-400 text-lg">Bem-vindo ao seu Manual de Combate!</p>
                        <p className="text-gray-500 mt-2">Crie seu primeiro cenário na barra lateral para começar a organizar seus poderes.</p>
                    </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
      
      <SkillFormModal
        isOpen={isSkillFormOpen}
        onClose={() => setIsSkillFormOpen(false)}
        onSubmit={handleSkillFormSubmit}
        skillToEdit={skillToEdit}
      />

      {activeScenario && <AIAssistantModal 
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onAddSkill={handleAddSkill}
        scenarioName={activeScenario.name}
      />}

      <AIScenarioAssistantModal
        isOpen={isScenarioAssistantOpen}
        onClose={() => setIsScenarioAssistantOpen(false)}
        onAddScenario={addNewScenario}
      />

      <ConfirmationDialog
        isOpen={!!dialogConfig}
        onClose={() => setDialogConfig(null)}
        onConfirm={dialogConfig?.onConfirm || (() => {})}
        title={dialogConfig?.title || ''}
        description={dialogConfig?.description || ''}
      />

    </div>
  );
}

export default App;
