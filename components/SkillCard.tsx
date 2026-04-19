import React from 'react';
import type { Skill } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface SkillCardProps {
    skill: Skill;
    onEdit: () => void;
    onDelete: () => void;
}

export const SkillCard = React.memo(function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg transition-transform hover:scale-105 hover:border-yellow-500/50">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-yellow-400 font-serif truncate" title={skill.name}>
                            {skill.name}
                        </h3>
                        {skill.origin && (
                            <span className="text-xs font-semibold bg-gray-600 text-gray-200 px-2 py-0.5 rounded-full">
                                {skill.origin}
                            </span>
                        )}
                    </div>
                    {skill.manaCost && (
                        <p className="text-xs text-cyan-300 font-mono mt-1">Custo: {skill.manaCost}</p>
                    )}
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        className="text-gray-400 hover:text-yellow-400 transition"
                        aria-label={`Editar ${skill.name}`}
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label={`Apagar ${skill.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <p className="text-gray-300 mt-2">{skill.description}</p>
        </div>
    );
});
