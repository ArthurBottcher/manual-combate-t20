
import React, { useState, useEffect } from 'react';
import { Skill } from '../types';
import { CloseIcon } from './icons';

interface SkillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (skill: Omit<Skill, 'id'>) => void;
  skillToEdit?: Skill | null;
}

const SkillFormModal: React.FC<SkillFormModalProps> = ({ isOpen, onClose, onSubmit, skillToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manaCost, setManaCost] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.name);
      setDescription(skillToEdit.description);
      setManaCost(skillToEdit.manaCost || '');
      setOrigin(skillToEdit.origin || '');
    } else {
      setName('');
      setDescription('');
      setManaCost('');
      setOrigin('');
    }
  }, [skillToEdit, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onSubmit({ name, description, manaCost, origin });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 font-serif">{skillToEdit ? 'Editar Poder' : 'Adicionar Poder'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="skill-name" className="block text-sm font-medium text-gray-300 mb-2">Nome do Poder</label>
            <input
              id="skill-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
               <label htmlFor="skill-manaCost" className="block text-sm font-medium text-gray-300 mb-2">Custo (PM)</label>
               <input
                 id="skill-manaCost"
                 type="text"
                 value={manaCost}
                 onChange={(e) => setManaCost(e.target.value)}
                 placeholder="Ex: 2, Variável..."
                 className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
               />
             </div>
             <div>
               <label htmlFor="skill-origin" className="block text-sm font-medium text-gray-300 mb-2">Origem</label>
               <input
                 id="skill-origin"
                 type="text"
                 value={origin}
                 onChange={(e) => setOrigin(e.target.value)}
                 placeholder="Ex: Classe, Raça, Divindade"
                 className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
               />
             </div>
          </div>
          <div>
            <label htmlFor="skill-description" className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 rounded-md text-gray-900 font-semibold transition">
              {skillToEdit ? 'Salvar Alterações' : 'Criar Poder'}
            </button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SkillFormModal;
