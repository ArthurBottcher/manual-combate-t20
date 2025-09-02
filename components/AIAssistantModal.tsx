import React, { useState } from 'react';
import { toast } from 'sonner';
import { generateSkillSuggestion } from '../services/geminiService';
import { CharacterInfo, Skill } from '../types';
import { CloseIcon, SparklesIcon } from './icons';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skill: Omit<Skill, 'id'>) => void;
  scenarioName: string;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onAddSkill, scenarioName }) => {
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo>({
    race: '',
    characterClass: '',
    deity: '',
    level: '',
    feature: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<{ name: string; description: string; manaCost?: string; origin?: string; }[] | null>(null);

  if (!isOpen) {
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCharacterInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterInfo.race.trim() || !characterInfo.characterClass.trim() || !characterInfo.level.trim()) return;

    setIsLoading(true);
    setSuggestedSkills(null);

    try {
      const result = await generateSkillSuggestion(scenarioName, characterInfo);
      if (result && result.length > 0) {
        setSuggestedSkills(result);
      } else {
        toast.warning('Não foi possível encontrar poderes para essa descrição. Tente ser mais específico.');
      }
    } catch (err: any) {
        if (err.message.includes("API Key")) {
            toast.error('A chave de API do Gemini não está configurada. Defina a variável de ambiente API_KEY.');
        } else {
            toast.error('Ocorreu um erro ao se comunicar com a IA.');
        }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddSkill = (skillToAdd: { name: string; description: string; manaCost?: string; origin?: string; }) => {
      onAddSkill(skillToAdd);
      setSuggestedSkills(currentSkills => currentSkills?.filter(s => s.name !== skillToAdd.name) || null);
  }

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
        setCharacterInfo({ race: '', characterClass: '', deity: '', level: '', feature: '' });
        setSuggestedSkills(null);
        setIsLoading(false);
    }, 300); // Wait for modal close animation
  }

  const handleTryAgain = () => {
    setSuggestedSkills(null);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-400 font-serif flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2" />
            Assistente de Poderes T20
          </h2>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-400 mb-6">Descreva seu personagem para a IA sugerir poderes para o cenário: <strong className="text-purple-300">{scenarioName}</strong>.</p>

        {!suggestedSkills && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Raça*</label>
                    <input name="race" value={characterInfo.race} onChange={handleInputChange} placeholder="Ex: Humano, Elfo" required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Classe*</label>
                    <input name="characterClass" value={characterInfo.characterClass} onChange={handleInputChange} placeholder="Ex: Guerreiro, Mago" required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Divindade</label>
                    <input name="deity" value={characterInfo.deity} onChange={handleInputChange} placeholder="Ex: Khalmyr, Wynna" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nível*</label>
                    <input name="level" value={characterInfo.level} onChange={handleInputChange} placeholder="Ex: 5" required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Característica Marcante</label>
                <input name="feature" value={characterInfo.feature} onChange={handleInputChange} placeholder="Ex: Focado em duas armas, especialista em magias de fogo" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"/>
              </div>
              <button type="submit" disabled={isLoading || !characterInfo.race.trim() || !characterInfo.characterClass.trim() || !characterInfo.level.trim()} className="w-full flex items-center justify-center py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sugerindo...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Sugerir Poderes
                  </>
                )}
              </button>
            </form>
        )}
        
        {suggestedSkills && suggestedSkills.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Sugestões da IA:</h3>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {suggestedSkills.map((skill, index) => (
                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xl font-bold text-purple-300">{skill.name}</h4>
                            {skill.origin && (
                                <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{skill.origin}</span>
                            )}
                        </div>
                        {skill.manaCost && (
                            <p className="text-xs text-cyan-300 font-mono mt-1">Custo: {skill.manaCost}</p>
                        )}
                        <p className="text-gray-300 mt-2 text-sm">{skill.description}</p>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => handleAddSkill(skill)} className="py-1 px-3 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition text-sm">
                              Adicionar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
             <div className="flex justify-end space-x-4 mt-6">
                <button onClick={handleTryAgain} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition">
                  Tentar Outra Busca
                </button>
            </div>
          </div>
        )}

        {suggestedSkills?.length === 0 && !isLoading && (
            <div className="mt-6 text-center animate-fade-in">
                <p className="text-gray-300">Todas as sugestões foram adicionadas.</p>
                 <div className="flex justify-center space-x-4 mt-6">
                    <button onClick={handleTryAgain} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition">
                        Buscar Novamente
                    </button>
                    <button onClick={resetAndClose} className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition">
                        Fechar
                    </button>
                </div>
            </div>
        )}

      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AIAssistantModal;
