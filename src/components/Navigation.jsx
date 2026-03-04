import React from 'react';

export default function Navigation({ currentMode, setMode }) {
    const modes = [
        { id: 'classic', label: 'Classic', icon: '👤' },
        { id: 'quote', label: 'Quote', icon: '💬' },
        { id: 'ability', label: 'Ability', icon: '✨' },
        { id: 'splash', label: 'Splash', icon: '🖼️' }
    ];

    return (
        <div className="flex justify-center gap-2 md:gap-6 mb-8 mt-2 w-full max-w-[600px] border-b border-elden-gold/20 pb-4">
            {modes.map(mode => (
                <button
                    key={mode.id}
                    onClick={() => setMode(mode.id)}
                    className={`flex flex-col items-center justify-center p-3 w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all duration-300 relative group overflow-hidden ${currentMode === mode.id
                            ? 'bg-gradient-to-br from-elden-gold/90 to-elden-gold/60 text-elden-black border-2 border-elden-gold shadow-[0_0_20px_rgba(198,162,91,0.5)] transform scale-105'
                            : 'bg-[#1e1e1e] text-elden-gold border-2 border-elden-gold/30 hover:border-elden-gold/80 hover:bg-[#2a2a2a]'
                        }`}
                >
                    <span className="text-2xl md:text-3xl z-10">{mode.icon}</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 z-10">{mode.label}</span>
                    {currentMode === mode.id && (
                        <div className="absolute inset-0 bg-white/20 z-0 animate-pulse"></div>
                    )}
                </button>
            ))}
        </div>
    );
}
