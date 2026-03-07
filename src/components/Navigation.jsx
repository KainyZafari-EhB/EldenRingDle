import React from 'react';

// --- Inline SVG Icon Components (matching EldenDle.jsx) ---
const IconSword = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6" />
        <path d="M16 16l4 4" />
        <path d="M19 21l2-2" />
        <path d="M14.5 6.5L18 3h3v3l-3.5 3.5" />
    </svg>
);

const IconScroll = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h12a2 2 0 002-2v-1a2 2 0 00-2-2H6" />
        <path d="M8 21a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v1" />
        <path d="M4 19a2 2 0 01-2-2V7a2 2 0 012-2" />
        <line x1="10" y1="8" x2="18" y2="8" />
        <line x1="10" y1="12" x2="16" y2="12" />
    </svg>
);

const IconFlame = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c-4.97 0-7-3.58-7-7 0-3.07 2.17-6.17 4-7.83C10.7 5.6 12 3 12 2c0 0 2.5 2.1 4.5 5.17C18.5 10.24 19 12.5 19 15c0 3.42-2.03 7-7 7z" />
        <path d="M10 15.5c0 1.38.62 2.5 2 2.5s2-1.12 2-2.5c0-1.5-2-4-2-4s-2 2.5-2 4z" />
    </svg>
);

const IconEye = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const modeIcons = {
    classic: IconSword,
    quote: IconScroll,
    ability: IconFlame,
    splash: IconEye,
};

export default function Navigation({ currentMode, setMode }) {
    const modes = [
        { id: 'classic', label: 'Classic' },
        { id: 'quote', label: 'Quote' },
        { id: 'ability', label: 'Ability' },
        { id: 'splash', label: 'Splash' }
    ];

    return (
        <div className="flex justify-center items-center gap-1.5 md:gap-6 mb-6 md:mb-8 mt-2 w-full max-w-[600px] border-b border-elden-gold/20 pb-4 px-2">
            {modes.map(mode => {
                const Icon = modeIcons[mode.id];
                return (
                    <button
                        key={mode.id}
                        onClick={() => setMode(mode.id)}
                        className={`flex flex-col items-center justify-center p-2 md:p-3 w-14 h-14 md:w-20 md:h-20 rounded-xl transition-all duration-300 relative group overflow-hidden ${currentMode === mode.id
                            ? 'bg-gradient-to-br from-elden-gold/90 to-elden-gold/60 text-elden-black border-2 border-elden-gold shadow-[0_0_20px_rgba(198,162,91,0.5)] transform scale-105'
                            : 'bg-[#1e1e1e] text-elden-gold border-2 border-elden-gold/30 hover:border-elden-gold/80 hover:bg-[#2a2a2a]'
                            }`}
                    >
                        <Icon className="w-5 h-5 md:w-7 md:h-7 z-10" />
                        <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest mt-0.5 md:mt-1 z-10">{mode.label}</span>
                        {/* Bottom-bar active indicator */}
                        {currentMode === mode.id && (
                            <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-elden-black/60 rounded-t-full z-20"></div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
