// AISelector.jsx
import React from 'react';

const AISelector = ({ difficulty, opponentType, onDifficultyChange, onOpponentTypeChange }) => {
  const opponentTypes = [
    { id: 'random', name: 'Random Team', description: 'Randomly generated Pokémon' },
    { id: 'gym_leader', name: 'Gym Leader', description: 'Balanced competitive team' },
    { id: 'elite_four', name: 'Elite Four', description: 'Powerful legendary team' },
    { id: 'starter', name: 'Starter Team', description: 'All starter Pokémon' },
    { id: 'legendary', name: 'Legendary Team', description: 'Legendary Pokémon only' },
  ];

  return (
    <div className="space-y-6">
      {/* Difficulty Selection */}
      <div>
        <h3 className="text-white font-bold mb-3">AI Difficulty</h3>
        <div className="grid grid-cols-3 gap-2">
          {['easy', 'medium', 'hard'].map(level => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={`py-2 rounded-lg transition-colors capitalize ${
                difficulty === level
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Opponent Type Selection */}
      <div>
        <h3 className="text-white font-bold mb-3">Opponent Team</h3>
        <div className="space-y-2">
          {opponentTypes.map(type => (
            <div
              key={type.id}
              onClick={() => onOpponentTypeChange(type.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                opponentType === type.id
                  ? 'bg-[#ef4444]/20 border-2 border-[#ef4444]' 
                  : 'bg-[#1a1a1a] border border-[#7f1d1d]/30 hover:border-[#ef4444]/50'
              }`}
            >
              <h4 className="font-bold text-white">{type.name}</h4>
              <p className="text-gray-300 text-sm">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AISelector;