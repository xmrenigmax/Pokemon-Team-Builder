// BattleLog.jsx
import React, { useEffect, useRef } from 'react';

const BattleLog = ({ logEntries }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logEntries]);

  return (
    <div className="pokemon-card p-6">
      <h3 className="text-xl font-bold mb-4 text-[#ef4444]">Battle Log</h3>
      <div className="h-64 overflow-y-auto bg-[#1a1a1a] rounded-lg p-4">
        {logEntries.length === 0 ? (
          <p className="text-gray-400 text-center">Battle log will appear here...</p>
        ) : (
          <div className="space-y-2">
            {logEntries.map((entry, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-500 mr-2">Turn {entry.turn}:</span>
                <span className="text-white">{entry.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleLog;